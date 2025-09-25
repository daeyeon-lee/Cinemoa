import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Footer from '@/component/footer/footer';
import QueryProvider from '@/providers/QueryProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleAnalytics from '@/lib/GoogleAnalytics';
import GA4Debugger from '@/components/GA4Debugger';
const kakaoMapApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

export const metadata: Metadata = {
  title: '씨네모아',
  description: '씨네모아',
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      {/* 루트 컴포넌트 스타일 지정 : 배경색 지정, navbar,main,footer flex로 나눔, 폰트 색상 지정 */}
      <body className="antialiased bg-BG-0 flex flex-col text-primary min-h-screen">
        {/* Google Analytics */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ''} />

        {/* GA4 디버거 (개발 환경에서만 표시) */}
        <GA4Debugger />

        {/* 카카오맵 스크립트 */}
        <Script type="text/javascript" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}&libraries=services&autoload=false`} strategy="beforeInteractive" />
        {/* 구글 로그인 스크립트 */}
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          {/* 리액트 쿼리 */}
          <QueryProvider>
            {children} {/* 각 그룹의 레이아웃이 여기에 들어감 */}
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
