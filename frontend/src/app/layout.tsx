import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/component/nav/navbar';
import Footer from '@/component/footer/footer';
import QueryProvider from '@/providers/QueryProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  // if (!googleClientId) {
    // console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID 가 비어 있습니다. GSI가 403/구성 오류를 낼 수 있어요.');
  // }
  // console.log('googleClientId', googleClientId);
  return (
    <html lang="ko">
      <body className="antialiased bg-BG-0 text-primary w-full max-xl:px-4 flex flex-col items-center">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        <QueryProvider>
          <div className="sm:w-[1200px] min-h-screen flex flex-col">
            {/* 상단 네비게이션 바 */}
            <Navbar />
            {/* 콘텐츠 영역 */}
            <main className="flex-1">{children}</main>
          </div>
          {/* 하단 footer - 화면 전체 너비 */}
          <div className="w-full">
              <Footer />
            </div>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
