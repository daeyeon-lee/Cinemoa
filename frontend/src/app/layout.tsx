import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/component/nav/navbar';
import Footer from '@/component/footer/footer';
import QueryProvider from '@/providers/QueryProvider';

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
  return (
    <html lang="ko">
      <body className="antialiased bg-BG-0 text-primary w-full max-xl:px-4 flex flex-col items-center">
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
      </body>
    </html>
  );
}
