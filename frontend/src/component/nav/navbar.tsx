'use client';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useCallback, useEffect } from 'react';

import SearchIcon from '@/component/icon/searchIcon';
import UserIcon from '@/component/icon/userIcon';
import LoginIcon from '@/component/icon/loginIcon';
import LogoutIcon from '@/component/icon/logoutIcon';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/api/auth';
import Ticket from './ticket';

export default function Navbar() {
  // navbar 페이지 활성화 여부 확인 함수
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { user, isLoggedIn } = useAuthStore();

  // 클라이언트 사이드에서만 인증 상태 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 인증 상태 디버깅
  useEffect(() => {
    if (isClient) {
      console.log('[Navbar] 인증 상태:', { user, isLoggedIn: isLoggedIn(), isClient });
    }
  }, [isClient, user, isLoggedIn]);
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

  // 검색 실행 핸들러
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  // 엔터키 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

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

  // 마이페이지 접근 핸들러
  const handleMyPageClick = (e: React.MouseEvent) => {
    if (!isClient || !user || !isLoggedIn()) {
      e.preventDefault();
      router.push('/auth');
    }
  };

  // 만들기 페이지 접근 핸들러
  const handleCreateClick = (e: React.MouseEvent) => {
    if (!isClient || !user || !isLoggedIn()) {
      e.preventDefault();
      router.push('/auth');
    }
  };
  return (
    <header className="bg-slate-900 border-b border-slate-900 py-5 lg:pt-4">
      {/* 모바일 레이아웃 - 두 줄 */}
      <div className="border-b border-1 border-[#1E293B] px-5 lg:hidden">
        {/* 첫 번째 줄: 로고 + 아이콘들 */}
        <div className="flex items-center justify-between mb-4 ">
          <Link href="/" className="cursor-pointer">
            <img src="/cinemoa_logo_long.png" alt="씨네모아" className="h-8" />
          </Link>
          <div className="flex items-center space-x-4">
            <SearchIcon />
            {isClient && user && isLoggedIn() ? (
              <>
                <Link href="/mypage" className="cursor-pointer" onClick={handleMyPageClick}>
                  <UserIcon />
                </Link>
                <button onClick={handleLogout} className="cursor-pointer">
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
          <Link href="/create" className={getLinkClasses('/create')} onClick={handleCreateClick}>
            만들기
            {isActive('/create') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
          </Link>
        </nav>
      </div>

      {/* 데스크톱 레이아웃 - 한 줄 */}
      <div className="hidden max-w-[1200px] mx-auto lg:flex items-center justify-between lg:px-5 px-2">
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
            <Link href="/create" className={getLinkClasses('/create')} onClick={handleCreateClick}>
              만들기
              {isActive('/create') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </Link>
          </nav>
        </div>

        {/* 검색바 + 로그인/회원가입 */}
        <div className="flex items-center space-x-4">
          <div className="flex w-full items-center space-x-2">
            {/* 홈 페이지와 검색 페이지가 아닐 때만 검색창 표시 */}
            {pathname !== '/' && pathname !== '/home' && pathname !== '/search' && (
              <div className="relative flex-1 min-w-0">
                <Input
                  type="text"
                  placeholder="검색어를 입력해주세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8 bg-BG-1 text-primary placeholder:text-tertiary border-none rounded-[8px] pr-10 pl-3"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={handleSearch}>
                  <SearchIcon stroke="#94A3B8" />
                </div>
              </div>
            )}
            {isClient && user && isLoggedIn() ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" textSize="sm" className="flex-none cursor-pointer">
                      스마트 티켓
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[100vh] overflow-y-auto">
                    <DialogHeader className="self-stretch">
                      <DialogTitle>스마트 티켓</DialogTitle>
                    </DialogHeader>
                    <Ticket />
                  </DialogContent>
                </Dialog>
                <Link href="/mypage" className="flex-none cursor-pointer" onClick={handleMyPageClick}>
                  <Button className="rounded-[99px]" variant="secondary" size="sm" textSize="sm">
                    마이페이지
                  </Button>
                </Link>
                <Button onClick={handleLogout} className="rounded-[99px]" variant="primary" size="sm" textSize="sm">
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
                  <Button className="w-full rounded-[99px] text-inverse font-semibold text-xs" variant="primary" size="sm" textSize="sm">
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
