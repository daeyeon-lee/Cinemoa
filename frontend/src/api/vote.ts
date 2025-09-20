import { CreateVoteFundingParams, CreateVoteFundingResponse } from '@/types/vote';
const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
// 펀딩 생성 API
export const creatVoteFunding = async (data: CreateVoteFundingParams, posterUrl: string): Promise<CreateVoteFundingResponse> => {
  const formData = new FormData();
  
  // posterUrl이 없거나 빈 문자열인 경우 에러 처리
  if (!posterUrl || posterUrl.trim() === '') {
    throw new Error('포스터 이미지가 필요합니다.');
  }

  // posterUrl 형식 확인
  console.log('이미지 형식:', posterUrl.startsWith('http') ? '외부 URL' : 'Base64');

  // 외부 URL (TMDB 같은) → JSON 필드에 posterUrl 추가
  if (posterUrl.startsWith('http')) {
    console.log('외부 URL 형식입니다. http');
    formData.append(
      'request',
      new Blob([JSON.stringify({ ...data, posterUrl })], {
        type: 'application/json',
      })
    );
  }
  // Base64 (data:image/...) → Blob 변환해서 파일 전송
  else if (posterUrl.startsWith('data:image')) {
    console.log('Base64 형식입니다. data:image/...');
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
  // 지원하지 않는 형식인 경우 에러 처리
  else {
    throw new Error('지원하지 않는 이미지 형식입니다. URL 또는 Base64 형식의 이미지를 사용해주세요.');
  }
  
  try {
    console.log('=== 투표 펀딩 생성 API 요청 시작 ===');
    console.log('요청 데이터:', data);
    console.log('bannerImg:', posterUrl);
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    console.log('formData:', formData);
    const response = await fetch(`${BaseUrl}vote`, {
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

    const result: CreateVoteFundingResponse = await response.json();
    console.log('=== 투표 펀딩 생성 API 요청 성공 ===');
    console.log('응답 데이터:', result);

    return result;
  } catch (error) {
    console.error('=== 투표 펀딩 생성 API 요청 실패 ===');
    console.error('에러:', error);
    throw error;
  }
};
