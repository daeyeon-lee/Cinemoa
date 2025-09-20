import { CreateFundingParams, CreateFundingResponse } from '@/types/funding';
const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
// 펀딩 생성 API
export const createFunding = async (data: CreateFundingParams, posterUrl: string): Promise<CreateFundingResponse> => {
  const formData = new FormData();

  // Base64를 Blob으로 변환
  // const response = await fetch(posterUrl); // posterUrl이 data:image/... 형태라면
  // const blob = await response.blob();
  // formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  // formData.append('bannerImg', new File([blob], 'banner.png', { type: blob.type || 'image/png' }));
   
  // 외부 URL (TMDB 같은) → JSON 필드에 posterUrl 추가
   if (posterUrl.startsWith('http')) {
    formData.append(
      'request',
      new Blob([JSON.stringify({ ...data, posterUrl })], {
        type: 'application/json',
      })
    );
  }
  // Base64 (data:image/...) → Blob 변환해서 파일 전송
  else if (posterUrl.startsWith('data:image')) {
    const byteString = atob(posterUrl.split(',')[1]);
    const mimeType =
      posterUrl.split(',')[0].match(/:(.*?);/)?.[1] || 'image/png';
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });

    formData.append(
      'request',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );
    formData.append(
      'bannerImg',
      new File([blob], 'banner.png', { type: mimeType })
    );
  }
  try {
    console.log('=== 펀딩 생성 API 요청 시작 ===');
    console.log('요청 데이터 data:', data);
    console.log('bannerImg:', posterUrl);

    // for (const [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }
    const response = await fetch(`${BaseUrl}funding`, {
      method: 'POST',
      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result: CreateFundingResponse = await response.json();
    console.log('=== 펀딩 생성 API 요청 성공 ===');
    console.log('응답 데이터:', result);

    return result;
  } catch (error) {
    console.error('=== 펀딩 생성 API 요청 실패 ===');
    console.error('에러:', error);
    throw error;
  }
};
