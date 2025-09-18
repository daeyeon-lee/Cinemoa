'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { googleLogin } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

export default function Signup() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("GoogleLogin 응답:", credentialResponse);

    const idToken = credentialResponse.credential;
    if (!idToken) {
      console.error("GoogleLogin: credential(ID 토큰)이 없습니다.");
      return;
    }

    try {
      const response = await googleLogin(idToken);
      console.log("GoogleLogin Response:", response);

      if (response && response.code === 0) {
        // 로그인 성공 후 isAnonymous 상태에 따른 라우팅
        if (response.data.isAnonymous) {
          // 익명 사용자인 경우 추가 정보 입력 페이지로 이동
          router.push("/auth/info/step1");
        } else {
          // 일반 사용자인 경우 홈페이지로 이동
          router.push("/home");
        }
      }
    } catch (error) {
      console.error("Google 로그인 에러:", error);
      alert("Google 로그인에 실패했습니다.");
    }
  };

  const handleGoogleLoginError = () => {
    console.log("GoogleLogin Failed");
    alert("Google 로그인에 실패했습니다.");
  };
  // console.log('window.location.origin', window.location.origin);

  return (
    <div className="flex flex-col items-center justify-center pt-60 text-center">
      {/* 메인 콘텐츠 */}
      <div className="sm:w-[320px] flex flex-col items-center justify-center space-y-8 w-full">
        <img src="/login_icon.png" width={360} height={75} alt="씨네모아" />
        {/* <img src="/google_login_logo.png" alt="Google" /> */}
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
          // useOneTap
          useOneTap={false}
          type="icon"
          theme="filled_blue"
          shape="circle"
          size="large"
        />
      </div>

      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-slate-800 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-700 rounded-full opacity-30"></div>
      </div>
    </div>
  );
}
