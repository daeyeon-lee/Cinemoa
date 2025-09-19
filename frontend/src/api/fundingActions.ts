/**
 * 펀딩 액션 관련 API
 * 
 * 좋아요 토글, 참여하기 등 상호작용 API만 담당합니다.
 */

import type { ApiResponse } from '@/types/fundingDetail';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// 좋아요 토글 API
export const toggleFundingLike = async (
  fundingId: number,
  userId: string,
  isLiked: boolean
): Promise<ApiResponse<null>> => {
  try {
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      throw new Error('유효하지 않은 userId');
    }

    if (isLiked) {
      // 좋아요 취소
      const response = await fetch(
        `${API_BASE_URL}funding/${fundingId}/like?userId=${numericUserId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error(`좋아요 취소 실패: ${response.status}`);
      return response.json();
    } else {
      // 좋아요 추가 (⚡ body 제거, query만 사용)
      const response = await fetch(
        `${API_BASE_URL}funding/${fundingId}/like?userId=${numericUserId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error(`좋아요 추가 실패: ${response.status}`);
      return response.json();
    }
  } catch (error) {
    console.error('[좋아요 토글 에러]:', error);
    throw error;
  }
};


// 펀딩 참여하기 API (필요시 추가)
export const participateInFunding = async (fundingId: number, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}funding/${fundingId}/participate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`참여하기 실패: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('[펀딩 참여 성공]:', fundingId);
    
    return result;
  } catch (error) {
    console.error('[펀딩 참여 에러]:', error);
    throw error;
  }
};
