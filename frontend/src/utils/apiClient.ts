import { useAuthStore } from '@/stores/authStore';

interface ApiRequestOptions extends RequestInit {
  includeAuth?: boolean; // 인증 정보 포함 여부 (기본값: true)
}

/**
 * 세션 기반 인증을 사용하는 fetch 래퍼 함수
 */
export const apiClient = async (url: string, options: ApiRequestOptions = {}) => {
  const { includeAuth = true, ...fetchOptions } = options;
  
  // 기본 헤더 설정
  const headers = new Headers(fetchOptions.headers);
  
  // Content-Type이 설정되지 않은 경우 기본값 설정
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // fetch 요청 실행 (세션 쿠키는 자동으로 포함됨)
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: includeAuth ? 'include' : 'omit', // 인증이 필요한 경우 쿠키 포함
  });
  
  // 401 에러인 경우 세션이 만료된 것으로 간주하고 로그아웃 처리
  if (response.status === 401 && includeAuth) {
    const { clearUser } = useAuthStore.getState();
    clearUser();
  }
  
  return response;
};

/**
 * GET 요청을 위한 헬퍼 함수
 */
export const apiGet = async (url: string, options: Omit<ApiRequestOptions, 'method'> = {}) => {
  return apiClient(url, { ...options, method: 'GET' });
};

/**
 * POST 요청을 위한 헬퍼 함수
 */
export const apiPost = async (url: string, data?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) => {
  return apiClient(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * PUT 요청을 위한 헬퍼 함수
 */
export const apiPut = async (url: string, data?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) => {
  return apiClient(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * DELETE 요청을 위한 헬퍼 함수
 */
export const apiDelete = async (url: string, options: Omit<ApiRequestOptions, 'method'> = {}) => {
  return apiClient(url, { ...options, method: 'DELETE' });
};
