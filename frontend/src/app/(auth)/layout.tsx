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

// 로그인 페이지 레이아웃 (navbar, footer 없음)
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="w-full min-h-screen">
      <main className="w-full max-w-full">{children}</main>
    </div>
  );
}
