import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/component/nav/navbar";

export const metadata: Metadata = {
  title: "씨네모아",
  description: "씨네모아",
  icons: {
    icon: "/cinemoa_logo_short.png",
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-slate-900 text-white w-full">
        <div className="max-w-[1200px] mx-auto px-4 sm:mx-8 md:mx-16 lg:mx-24 xl:mx-32 2xl:mx-[360px]">
          {/* 상단 네비게이션 바 */}
          <Navbar />

          {/* 콘텐츠 영역 */}
          <main className="flex-1 bg-slate-900">{children}</main>
        </div>
      </body>
    </html>
  );
}
