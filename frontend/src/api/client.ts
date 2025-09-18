/**
 * API 클라이언트 유틸리티
 *
 * @description 백엔드 API 호출을 위한 공통 유틸리티 함수들
 * - 환경변수에서 BASE_URL 읽기
 * - API 엔드포인트 URL 생성
 * - 쿼리 파라미터 처리 (배열, 단일값 등)
 */

// 환경변수에서 API 베이스 URL 읽기
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// 환경변수 검증
if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL is not defined in environment variables');
}

/**
 * API URL을 생성하는 함수
 *
 * @param endpoint - API 엔드포인트 (예: 'search', 'users' 등)
 * @param params - 쿼리 파라미터 객체
 * @returns 완성된 API URL
 *
 * @example
 * ```typescript
 * // 기본 사용
 * buildUrl('search', { fundingType: 'FUNDING' })
 * // 결과: "https://j13a110.p.ssafy.io:8443/api/search?fundingType=FUNDING"
 *
 * // 배열 파라미터 처리
 * buildUrl('search', { category: [1, 2, 3] })
 * // 결과: "https://j13a110.p.ssafy.io:8443/api/search?category=1&category=2&category=3"
 * ```
 */
export const buildUrl = (endpoint: string, params: Record<string, any> = {}): string => {
  // BASE_URL과 endpoint를 결합하여 기본 URL 생성
  const url = new URL(endpoint, BASE_URL);

  console.log('🔧 [buildUrl] URL 생성 시작:', { endpoint, params });

  // 파라미터를 순회하며 쿼리스트링에 추가
  Object.entries(params).forEach(([key, value]) => {
    // undefined, null, 빈 문자열은 제외
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // 배열인 경우: 각 요소를 개별 파라미터로 추가
        // 예: category=[1,2] → ?category=1&category=2
        console.log(`📋 [buildUrl] 배열 파라미터 ${key}:`, value);
        value.forEach((item) => url.searchParams.append(key, item.toString()));
      } else {
        // 단일값인 경우: 해당 키에 값 설정
        console.log(`📝 [buildUrl] 단일 파라미터 ${key}:`, value);
        url.searchParams.set(key, value.toString());
      }
    } else {
      console.log(`⏭️ [buildUrl] 파라미터 ${key} 스킵:`, value);
    }
  });

  const finalUrl = url.toString();
  console.log('✅ [buildUrl] 최종 URL:', finalUrl);

  return finalUrl;
};

/**
 * API 베이스 URL을 반환하는 함수
 *
 * @returns API 베이스 URL
 */
export const getBaseUrl = (): string => {
  return BASE_URL;
};