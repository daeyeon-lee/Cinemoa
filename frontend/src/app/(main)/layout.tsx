import Navbar from '@/component/nav/navbar';
import Footer from '@/component/footer/footer';
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:w-[1200px] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
