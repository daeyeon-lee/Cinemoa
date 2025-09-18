import { useAuthStore } from '@/stores/authStore';

interface ApiRequestOptions extends RequestInit {
  includeAuth?: boolean; // 인증 정보 포함 여부 (기본값: true)
}

/**
 * 사용자 인증 정보를 자동으로 헤더에 포함하는 fetch 래퍼 함수
 */
export const apiClient = async (url: string, options: ApiRequestOptions = {}) => {
  const { includeAuth = true, ...fetchOptions } = options;
  
  // 기본 헤더 설정
  const headers = new Headers(fetchOptions.headers);
  
  // Content-Type이 설정되지 않은 경우 기본값 설정
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // 인증 정보 포함이 필요한 경우
  if (includeAuth) {
    const { user } = useAuthStore.getState();
    
    if (user) {
      headers.set('X-User-Id', user.userId.toString());
      headers.set('X-User-Email', user.email);
    }
  }
  
  // fetch 요청 실행
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  
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
