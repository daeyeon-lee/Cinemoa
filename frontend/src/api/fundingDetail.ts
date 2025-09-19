/**
 * 펀딩 상세 조회 전용 API
 * 
 * 단일 펀딩의 상세 정보 조회만 담당합니다.
 */

import type { DetailData, ApiResponse } from '@/types/fundingDetail';


// 펀딩 상세 조회 (userId 포함하면 개인화 정보 포함)
export const getFundingDetail = async (
  fundingId: string,
  userId?: string
): Promise<ApiResponse<DetailData>> => {
  try {
    const searchParams = new URLSearchParams();
    if (userId) searchParams.set("user_id", userId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}funding/${fundingId}?${searchParams.toString()}`,
      {
        credentials: "include", // ✅ 로그인 상태면 쿠키 전송, 아니면 안 붙음
      }
    );

    if (!response.ok) {
      throw new Error(`상세 조회 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log("[펀딩 상세 조회 성공]:", fundingId);

    return result;
  } catch (error) {
    console.error("[펀딩 상세 조회 에러]:", error);
    throw error;
  }
};

