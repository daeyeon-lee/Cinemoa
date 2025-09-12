import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/component/nav/navbar';
import Footer from '@/component/footer/footer';
import Script from 'next/script';

const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`;

// 환경 변수 확인 (서버 사이드 로그)
console.log('=== Layout 환경 변수 확인 ===');
console.log('API Key:', KAKAO_MAP_API_KEY);
console.log('SDK URL:', KAKAO_SDK_URL);

export const metadata: Metadata = {
  title: '씨네모아',
  description: '씨네모아',
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width', // 웹페이지의 너비를 기기의 화면에 맞춤
  initialScale: 1, // 페이지 로드시 100%로 표시
};

//TypeScript의 글로벌 'Window' interface를 확장하여 'kakao' 라는 속성을 추가하는 역할
//기본적으로 'window' 객체에 'kakao' 라는 속성이 존재하지 않으므로, 이를 추가하고 타입은 'any'로 설정
declare global {
  interface Window {
    kakao: any;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-BG-0 text-white w-full max-xl:px-4 flex flex-col items-center">
        {/* 카카오맵 스크립트는 KakaoMap 컴포넌트에서 로드 */}
        <div className="sm:w-[1200px]">
          {/* 상단 네비게이션 바 */}
          <Navbar />
          {/* 콘텐츠 영역 */}
          <main className="flex-1">{children}</main>
        </div>
        {/* 하단 footer - 화면 전체 너비 */}
        <div className="w-full">
          <Footer />
        </div>
      </body>
    </html>
  );
}
