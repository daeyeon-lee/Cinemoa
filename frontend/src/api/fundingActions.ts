/**
 * 펀딩 액션 관련 API
 * 
 * 좋아요 토글, 참여하기 등 상호작용 API만 담당합니다.
 */

import type { ApiResponse } from '@/types/fundingDetail';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// 좋아요 토글 API
export const toggleFundingLike = async (fundingId: number, userId: string, isLiked: boolean): Promise<ApiResponse<null>> => {
  try {
    // 🐛 API 호출 시점 디버깅
    console.log('=== API Call Debug ===');
    console.log('fundingId:', fundingId, typeof fundingId);
    console.log('userId:', userId, typeof userId);
    console.log('isLiked:', isLiked, typeof isLiked);
    
    // 🆕 토큰 확인
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    console.log('token:', token ? '있음' : '없음');
    console.log('token 값:', token);
    console.log('======================');
    
    if (isLiked) {
      // 좋아요 취소: DELETE /api/funding/{fundingId}/like?userId={userId}
      const response = await fetch(`${API_BASE_URL}funding/${fundingId}/like?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }), // 🆕 토큰 추가
        },
      });
      
      if (!response.ok) {
        throw new Error(`좋아요 취소 실패: ${response.status}`);
      }
      
      const result: ApiResponse<null> = await response.json();
      console.log('[좋아요 취소 성공]:', fundingId, result.message);
      
      return result;
    } else {
      // 좋아요 추가: POST /api/funding/{fundingId}/like (본문: userId)
      const response = await fetch(`${API_BASE_URL}funding/${fundingId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }), // 🆕 토큰 추가
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error(`좋아요 추가 실패: ${response.status}`);
      }
      
      const result: ApiResponse<null> = await response.json();
      console.log('[좋아요 추가 성공]:', fundingId, result.message);
      
      return result;
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
