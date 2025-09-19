import type { Metadata } from 'next';
import '@/app/globals.css';

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

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="sm:w-[1200px] min-h-screen flex flex-col">
      {/* 네비게이션 바 없음 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
