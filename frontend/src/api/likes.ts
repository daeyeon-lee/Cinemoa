/**
 * 펀딩 액션 관련 API
 * 
 * 좋아요 추가/취소
 */

import type { ApiResponse } from '@/types/fundingDetail';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// 중복 요청 방지를 위한 요청 추적
const pendingRequests = new Map<string, Promise<ApiResponse<null>>>();

// 요청 키 생성 함수 - 동일한 fundingId+userId에 대해서는 하나의 키만 사용
const getRequestKey = (fundingId: number, userId: string) => {
  return `like-${fundingId}-${userId}`;
};

// ✅ 좋아요 추가
export const addFundingLike = async (
  fundingId: number,
  userId: string
): Promise<ApiResponse<null>> => {
  const numericUserId = Number(userId);
  if (isNaN(numericUserId)) throw new Error('유효하지 않은 userId');

  const requestKey = getRequestKey(fundingId, userId);
  
  // ✅ 중복 요청 방지: 이미 진행 중인 요청이 있으면 기존 요청 반환
  if (pendingRequests.has(requestKey)) {
    console.log('🚫 중복 요청 방지 - 기존 요청 반환:', requestKey);
    return pendingRequests.get(requestKey)!;
  }

  try {
    console.log('[좋아요 추가 요청]:', { fundingId, userId: numericUserId });
    
    const fetchPromise = fetch(`${API_BASE_URL}funding/${fundingId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: numericUserId }),
      credentials: 'include',
    });
    
    // ✅ 요청을 추적에 추가하고 완료 시 제거
    const requestPromise = fetchPromise.then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 400 에러의 경우 더 구체적인 메시지 제공
        if (response.status === 400) {
          const message = errorData.message || '이미 좋아요를 누른 상영회이거나 잘못된 요청입니다.';
          throw new Error(message);
        }
        
        throw new Error(`좋아요 추가 실패: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const result: ApiResponse<null> = await response.json();
      console.log('[좋아요 추가 성공]:', fundingId, result.message);
      return result;
    }).finally(() => {
      // ✅ 요청 완료 후 추적에서 제거
      pendingRequests.delete(requestKey);
    });
    
    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  } catch (error) {
    console.error('[좋아요 추가 에러]:', error);
    pendingRequests.delete(requestKey);
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

  const requestKey = getRequestKey(fundingId, userId);
  
  // ✅ 중복 요청 방지: 이미 진행 중인 요청이 있으면 기존 요청 반환
  if (pendingRequests.has(requestKey)) {
    console.log('🚫 중복 요청 방지 - 기존 요청 반환:', requestKey);
    return pendingRequests.get(requestKey)!;
  }

  try {
    console.log('[좋아요 취소 요청]:', { fundingId, userId: numericUserId });
    
    const fetchPromise = fetch(
      `${API_BASE_URL}funding/${fundingId}/like?userId=${numericUserId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    // ✅ 요청을 추적에 추가하고 완료 시 제거
    const requestPromise = fetchPromise.then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 400 에러의 경우 더 구체적인 메시지 제공
        if (response.status === 400) {
          const message = errorData.message || '좋아요를 누르지 않은 상영회이거나 잘못된 요청입니다.';
          throw new Error(message);
        }
        
        throw new Error(`좋아요 취소 실패: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const result: ApiResponse<null> = await response.json();
      console.log('[좋아요 취소 성공]:', fundingId, result.message);
      return result;
    }).finally(() => {
      // ✅ 요청 완료 후 추적에서 제거
      pendingRequests.delete(requestKey);
    });
    
    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  } catch (error) {
    console.error('[좋아요 취소 에러]:', error);
    pendingRequests.delete(requestKey);
    throw error;
  }
};

