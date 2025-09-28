import { useAuthStore } from '@/stores/authStore';
import { LoginResponse, LogoutResponse } from '@/types/auth';
import { connectNotificationSSE, disconnectNotificationSSE, clearAllNotifications } from './notification';


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

      // SSE 알림 연결 시작 (약간의 지연 후)
      setTimeout(async () => {
        try {
          console.log('SSE 알림 연결 시도 중...');
          await connectNotificationSSE();
          console.log('SSE 알림 연결 성공');
        } catch (error) {
          console.error('SSE 알림 연결 실패:', error);
          console.error('에러 상세:', error instanceof Error ? error.message : String(error));
          // SSE 연결 실패해도 로그인은 성공으로 처리
        }
      }, 2000); // 2초 후 SSE 연결 시도 (쿠키 설정 시간 확보)
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
      `${process.env.NEXT_PUBLIC_BASE_URL}auth/logout`,
      {
        method: "GET",
        // method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include", // 쿠키 포함
      }
    );

    // SSE 알림 연결 종료
    disconnectNotificationSSE();
    console.log('SSE 알림 연결 종료');

    // 알림 데이터 초기화
    clearAllNotifications();
    console.log('알림 데이터 초기화');

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
    disconnectNotificationSSE();
    clearAllNotifications();
    useAuthStore.getState().clearUser();
    throw error;
  }
};
