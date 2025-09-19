import type { Metadata } from 'next';
import './globals.css';
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
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-BG-0 text-primary w-full flex flex-col items-center">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <QueryProvider>

              {children} {/* 각 그룹의 레이아웃이 여기에 들어감 */}

          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
