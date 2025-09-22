/**
 * 펀딩 액션 관련 API
 * 
 * 좋아요 추가/취소, 참여하기 등 상호작용 API만 담당합니다.
 */

import type { ApiResponse } from '@/types/fundingDetail';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ✅ 좋아요 추가
export const addFundingLike = async (
  fundingId: number,
  userId: string
): Promise<ApiResponse<null>> => {
  const numericUserId = Number(userId);
  if (isNaN(numericUserId)) throw new Error('유효하지 않은 userId');

  try {
    const response = await fetch(`${API_BASE_URL}funding/${fundingId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: numericUserId }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`좋아요 추가 실패: ${response.status}`);
    }

    const result: ApiResponse<null> = await response.json();
    console.log('[좋아요 추가 성공]:', fundingId, result.message);
    return result;
  } catch (error) {
    console.error('[좋아요 추가 에러]:', error);
    throw error;
  }
};

// ✅ 좋아요 취소
export const deleteFundingLike = async (
  fundingId: number,
  userId: string
): Promise<ApiResponse<null>> => {
  const numericUserId = Number(userId);
  if (isNaN(numericUserId)) throw new Error('유효하지 않은 userId');

  try {
    const response = await fetch(
      `${API_BASE_URL}funding/${fundingId}/like?userId=${numericUserId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`좋아요 취소 실패: ${response.status}`);
    }

    const result: ApiResponse<null> = await response.json();
    console.log('[좋아요 취소 성공]:', fundingId, result.message);
    return result;
  } catch (error) {
    console.error('[좋아요 취소 에러]:', error);
    throw error;
  }
};

// 펀딩 참여하기 API (필요시 사용)
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
