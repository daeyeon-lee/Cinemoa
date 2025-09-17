import { CategoryResponse } from '@/types/category';

// 카테고리 목록 조회 API
export const getCategories = async (): Promise<CategoryResponse[]> => {
  try {
    console.log('=== 카테고리 목록 조회 API 요청 시작 ===');
    const url = `https://j13a110.p.ssafy.io/api/category`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('=== 카테고리 목록 조회 API 요청 성공 ===');
    console.log('응답 데이터:', result);

    // data.items 배열을 반환
    return result;
  } catch (error) {
    console.error('=== 카테고리 목록 조회 API 요청 실패 ===');
    console.error('에러:', error);
    throw error;
  }
};
