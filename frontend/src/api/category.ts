import { CategoryResponse } from '@/types/category';

// 카테고리 목록 조회 API
export const getCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const url = 'https://j13a110.p.ssafy.io:8443/api/category';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('응답 데이터:', result.data.items);
    return result.data.items;
  } catch (error) {
    console.error('에러:', error);
    throw error;
  }
};
