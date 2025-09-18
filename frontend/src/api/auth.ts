import { useAuthStore } from '@/stores/authStore';
import { LoginResponse, LogoutResponse } from '@/types/auth';


// 구글 로그인 api (프론트 -> 백), idToken을 백으로 전송
export const googleLogin = async (idToken: string) => {
  try {
    // console.log("Google login idToken:", idToken);
    // 서버로 Google OAuth 토큰 전송
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}auth/login/oauth2/code/google`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함
        body: JSON.stringify({
          token: idToken,
          // code: credential,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const loginData: LoginResponse = await response.json();
    // console.log("Google login response:", loginData);

    // 로그인 성공 시 사용자 정보를 store에 저장
    if (loginData.code === 0 && loginData.data) {
      const { setUser } = useAuthStore.getState();
      setUser({
        userId: loginData.data.userId,
        email: loginData.data.email,
        isAnonymous: loginData.data.isAnonymous,
      });
    }

    return loginData;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// 로그아웃 API
export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await fetch(
      'https://j13a110.p.ssafy.io:8443/api/auth/logout',
      {
        method: "GET",
        credentials: "include", // 쿠키 포함
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const logoutData: LogoutResponse = await response.json();
    
    // 로그아웃 성공 시 store에서 사용자 정보 제거
    if (logoutData.code === 0) {
      const { clearUser } = useAuthStore.getState();
      clearUser();
      
      // localStorage에서도 명시적으로 제거
      localStorage.removeItem('auth-storage');
    }

    return logoutData;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
