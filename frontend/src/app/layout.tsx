import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/component/nav/navbar';

export const metadata: Metadata = {
  title: '씨네모아',
  description: '씨네모아',
  icons: {
    icon: '/cinemoa_logo_short.png',
  },
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-slate-900 text-white w-full max-xl:px-4 sm:flex sm:justify-center">
        <div className="sm:w-[1200px]">
          {/* 상단 네비게이션 바 */}
          <Navbar />

          {/* 콘텐츠 영역 */}
          <main className="flex-1 bg-slate-900">{children}</main>
        </div>
      </body>
    </html>
  );
}
