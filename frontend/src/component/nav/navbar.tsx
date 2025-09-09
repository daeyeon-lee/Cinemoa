'use client';
import { usePathname } from 'next/navigation';

import SearchIcon from '@/component/icon/searchIcon';
import UserIcon from '@/component/icon/userIcon';
import Link from 'next/link';
import Button from '@/component/button/button';
import SearchInput from '@/component/search/SearchInput';

export default function Navbar() {
  // navbar 페이지 활성화 여부 확인 함수
  const pathname = usePathname();

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

  return (
    <header className="bg-slate-900 border-b border-slate-900 py-3 pt-[108px] lg:pt-4">
      {/* 모바일 레이아웃 - 두 줄 */}
      <div className="border-b border-1 border-[#1E293B] lg:hidden">
        {/* 첫 번째 줄: 로고 + 아이콘들 */}
        <div className="flex items-center justify-between mb-4">
          <img src="/cinemoa_logo_long.png" alt="씨네모아" className="h-8" />
          <div className="flex items-center space-x-4">
            <SearchIcon />
            <UserIcon />
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
          {/* 로고고 */}
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
            <Link href="/create" className={getLinkClasses('/create')}>
              만들기
              {isActive('/create') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </Link>
          </nav>
        </div>

        {/* 검색바 + 로그인/회원가입 */}
        <div className="flex items-center space-x-4">
          <div className="flex w-full items-center space-x-2">
            <SearchInput placeholder="검색어를 입력해주세요" />
            <Link href="/auth">
              <Button color="secondary" text="로그인" size="sm" />
            </Link>
            <Link href="/auth">
              <Button color="primary" text="회원가입" size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
