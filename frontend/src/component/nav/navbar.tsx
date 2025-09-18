'use client';
import { usePathname, useRouter } from 'next/navigation';

import SearchIcon from '@/component/icon/searchIcon';
import UserIcon from '@/component/icon/userIcon';
import LoginIcon from '@/component/icon/loginIcon';
import LogoutIcon from '@/component/icon/logoutIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/api/auth';

export default function Navbar() {
  // navbar 페이지 활성화 여부 확인 함수
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = 'text-base font-bold cursor-pointer relative pb-1'; // 공통
    const activeClasses = 'text-primary'; // 활성화 - 흰색
    const inactiveClasses = 'text-tertiary'; // 비활성화 - 회색

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-900 py-3 pt-[108px] lg:pt-4">
      {/* 모바일 레이아웃 - 두 줄 */}
      <div className="border-b border-1 border-[#1E293B] lg:hidden">
        {/* 첫 번째 줄: 로고 + 아이콘들 */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="cursor-pointer">
            <img src="/cinemoa_logo_long.png" alt="씨네모아" className="h-8" />
          </Link>
          <div className="flex items-center space-x-4">
            <SearchIcon />
            {isLoggedIn ? (
              <>
                <Link href="/mypage" className="cursor-pointer">
                  <UserIcon />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogoutIcon />
                </button>
              </>
            ) : (
              <Link href="/auth" className="cursor-pointer">
                <LoginIcon />
              </Link>
            )}
          </div>
        </div>

        {/* 두 번째 줄: 네비게이션 메뉴 */}
        <nav className="flex items-center space-x-6">
          {/* <Link href="/" className="text-tertiary text-base font-bold cursor-pointer">
            홈
          </Link> */}
          <Link href="/category" className={getLinkClasses('/category')}>
            둘러보기
            {isActive('/category') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
          </Link>
          <Link href="/vote" className={getLinkClasses('/vote')}>
            이거어때
            {isActive('/vote') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
          </Link>
          <Link href="/create" className={getLinkClasses('/create')}>
            만들기
            {isActive('/create') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
          </Link>
        </nav>
      </div>

      {/* 데스크톱 레이아웃 - 한 줄 */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-start justify-center gap-16 h-full">
          {/* 로고-홈으로 이동 */}
          {/* 홈 주소로 변경함 */}
          <Link href="/" className="cursor-pointer">
            <img src="/cinemoa_logo_long.png" alt="씨네모아" className="w-[119px] h-full pb-1" />
          </Link>
          {/* navbar */}
          <nav className="flex items-center justify-center gap-x-8">
            {/* <Link href="/" className={getLinkClasses('/')}>
              홈{isActive('/') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </Link> */}
            <Link href="/category" className={getLinkClasses('/category')}>
              둘러보기
              {isActive('/category') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </Link>
            <Link href="/vote" className={getLinkClasses('/vote')}>
              이거어때
              {isActive('/vote') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </Link>
            {/* 임시로 결제창 붙여놓음 나중에 /create로 변경해야함함 */}
            <Link href="/create" className={getLinkClasses('/create')}>
              만들기
              {isActive('/create') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </Link>
          </nav>
        </div>

        {/* 검색바 + 로그인/회원가입 */}
        <div className="flex items-center space-x-4">
          <div className="flex w-full items-center space-x-2">
          {/* <div className="relative"> */}
            <div className="relative flex-1 min-w-0">
              <Input
                type="text"
                placeholder="검색어를 입력해주세요"
                className="h-8 bg-BG-1 text-primary placeholder:text-tertiary border-none rounded-[8px] pr-10 pl-3"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
                <SearchIcon stroke="#94A3B8" />
              </div>
            </div>
            {isLoggedIn ? (
              <>
                <Link href="/mypage" className="flex-none cursor-pointer">
                  <Button className="rounded-[99px]" variant="secondary" size="sm" textSize="sm">
                    마이페이지
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  className="rounded-[99px] text-inverse font-semibold text-xs flex-none cursor-pointer"
                  variant="primary"
                  size="sm"
                  textSize="sm"
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button className="w-full rounded-[99px]" variant="secondary" size="sm" textSize="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    className="w-full rounded-[99px] text-inverse font-semibold text-xs"
                    variant="primary"
                    size="sm"
                    textSize="sm"
                  >
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
