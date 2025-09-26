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
    const { clearUser } = useAuthStore.getState();
    
    const response = await fetch(
      'https://j13a110.p.ssafy.io:8443/api/auth/logout',
      {
        method: "GET",
        // method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include", // 쿠키 포함
      }
    );

    // 로그아웃 성공 여부와 관계없이 클라이언트에서 사용자 정보 제거
    clearUser();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const logoutData: LogoutResponse = await response.json();
    return logoutData;
  } catch (error) {
    console.error("Logout error:", error);
    // 에러가 발생해도 클라이언트에서는 로그아웃 처리
    useAuthStore.getState().clearUser();
    throw error;
  }
};
