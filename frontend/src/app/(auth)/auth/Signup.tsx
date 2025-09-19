'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { googleLogin } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

export default function Signup() {
  const router = useRouter();
  const { user } = useAuthStore();
  const googleLoginRef = useRef<HTMLDivElement>(null);

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    // console.log("GoogleLogin 응답:", credentialResponse);

    const idToken = credentialResponse.credential;
    if (!idToken) {
      console.error('GoogleLogin: credential(ID 토큰)이 없습니다.');
      return;
    }

    try {
      const response = await googleLogin(idToken);
      // console.log("GoogleLogin Response:", response);

      if (response && response.code === 0) {
        // 로그인 성공 후 isAnonymous 상태에 따른 라우팅
        if (response.data.isAnonymous) {
          // 익명 사용자인 경우 추가 정보 입력 페이지로 이동
          router.push('/auth/info/step1');
        } else {
          // 일반 사용자인 경우 홈페이지로 이동
          router.push('/home');
        }
      }
    } catch (error) {
      console.error('Google 로그인 에러:', error);
      alert('Google 로그인에 실패했습니다.');
    }
  };

  const handleGoogleLoginError = () => {
    console.log('GoogleLogin Failed');
    alert('Google 로그인에 실패했습니다.');
  };

  const handleButtonClick = () => {
    // 숨겨진 GoogleLogin 버튼을 프로그래밍 방식으로 클릭
    const googleButton = googleLoginRef.current?.querySelector('div[role="button"]') as HTMLElement;
    if (googleButton) {
      googleButton.click();
    }
  };
  // console.log('window.location.origin', window.location.origin);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* 로그인 폼 - 왼쪽 영역 */}
        <div className="flex flex-col justify-center flex-1 md:w-1/2 px-8 md:px-16 lg:px-24">
          <div className="max-w-md mx-auto w-full">
            {/* 로고/제목 */}
            <div className="flex justify-center">
              <img src="/cinema_home_logo.png" alt="씨네모아" className="w-full max-w-sm" />
            </div>
            {/* 로그인 버튼 */}
            <div className="mt-8">
              <Button variant="tertiary" size="lg" textSize="lg" className="w-full flex items-center justify-center gap-3 hover:bg-BG-3" onClick={handleButtonClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                구글로 시작하기
              </Button>
              <div ref={googleLoginRef} style={{ display: 'none' }}>
                <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} useOneTap={false} type="standard" shape="square" size="large" text="continue_with" />
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 이미지 영역 */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
          <div className="relative max-w-lg w-full">
            <img src="/mockup.png" alt="씨네모아" className="w-full h-auto object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
