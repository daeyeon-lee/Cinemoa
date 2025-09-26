import Navbar from '@/component/nav/navbar';
import Footer from '@/component/footer/footer';

// 메인 레이아웃 (navbar, footer 포함)
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 네비게이션 바 */}
      <Navbar />
      {/* 메인 컨텐츠 */}
      {/* 기본적으로 영역 전체 차지, 데스크탑 버전에서는 1200px 최대 너비 적용 */}
      <main className="w-full lg:max-w-[1200px] mx-auto flex-1">{children}</main>
      {/* 푸터 */}
      <Footer />
    </div>
  );
}
