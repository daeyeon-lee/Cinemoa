import Navbar from '@/component/nav/navbar';
import Footer from '@/component/footer/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
