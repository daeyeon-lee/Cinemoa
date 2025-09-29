'use client';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useCallback, useEffect } from 'react';
// 아이콘
import SearchIcon from '@/components/icon/searchIcon';
import TicketIcon from '@/components/icon/ticketIcon';
import UserIcon from '@/components/icon/userIcon';
import LoginIcon from '@/components/icon/loginIcon';
import LogoutIcon from '@/components/icon/logoutIcon';
import Link from 'next/link';
// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// 스마트티켓
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
// api
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/api/auth';
import { getUserInfo } from '@/api/mypage';
import { UserInfo } from '@/types/mypage';
import Ticket from '@/components/layout/ticket';
import NotificationDropdown from '@/components/layout/NotificationDropdown';

export default function Navbar() {
  // navbar 페이지 활성화 여부 확인 함수
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isMobileTicketOpen, setIsMobileTicketOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { user, isLoggedIn } = useAuthStore();

  // 클라이언트 사이드에서만 인증 상태 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 인증 상태 디버깅
  useEffect(() => {
    if (isClient) {
      // console.log('[Navbar] 인증 상태:', { user, isLoggedIn: isLoggedIn(), isClient });
    }
  }, [isClient, user, isLoggedIn]);

  // userInfo 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isClient && user && isLoggedIn()) {
        try {
          const response = await getUserInfo(user.userId);
          const { nickname, profileImgUrl } = response.data as any;
          setUserInfo({
            nickname,
            profileImgUrl: profileImgUrl,
          });
        } catch (error) {
          console.error('사용자 정보 가져오기 실패:', error);
          setUserInfo({
            nickname: '사용자',
            profileImgUrl: 'https://placehold.co/32x32',
          });
        }
      } else {
        setUserInfo(null);
      }
    };

    fetchUserInfo();
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
    <header className="sticky top-0 z-10 bg-BG-0 border-b border-BG-0 py-5 lg:pt-4">
      {/* 모바일 레이아웃 - 두 줄 */}
      <div className="border-b border-1 border-[#1E293B] px-5 lg:hidden">
        {/* 첫 번째 줄: 로고 + 아이콘들 */}
        <div className="flex items-center justify-between mb-4 ">
          {/* 로고 */}
          <Link href="/" className="cursor-pointer">
            <img src="/cinemoa_logo_long.png" alt="씨네모아" className="h-8" />
          </Link>
          <div className="flex items-center space-x-2">
            {/* 검색 아이콘 */}
            <Link href="/search/start" className="cursor-porinter">
              <SearchIcon width={20} height={20} />
            </Link>
            {/* 알림 아이콘 - 로그인한 사용자만 */}
            {isClient && user && isLoggedIn() && <NotificationDropdown isMobile={true} />}
            {/* 스마트 티켓 아이콘 - 로그인한 사용자만 */}
            {isClient && user && isLoggedIn() && (
              <Dialog open={isMobileTicketOpen} onOpenChange={setIsMobileTicketOpen}>
                <DialogTrigger asChild>
                  <button className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2cd8ce] to-[#ff5768] hover:from-[#2cd8ce] hover:to-[#e04e5f] flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[#71e5de]/25 relative overflow-hidden">
                    {/* 네온 글로우 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#71e5de]/20 to-[#ff5768]/20 rounded-full"></div>
                    <TicketIcon width={15} height={15} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-[90vw] max-h-[100vh] overflow-y-auto p-0 bg-transparent border-none shadow-none sm:w-full">
                  <DialogHeader variant="simple">
                    <VisuallyHidden>
                      <DialogTitle>스마트 티켓</DialogTitle>
                    </VisuallyHidden>
                  </DialogHeader>
                  <Ticket onClose={() => setIsMobileTicketOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
            {isClient && user && isLoggedIn() ? (
              <>
                <Link href="/mypage" className="cursor-pointer" onClick={handleMyPageClick}>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={userInfo?.profileImgUrl} />
                    <AvatarFallback />
                  </Avatar>
                </Link>
                {/* 로그아웃 아이콘 */}
                <button onClick={handleLogout} className="cursor-pointer">
                  <LogoutIcon width={22} height={22} />
                </button>
              </>
            ) : (
              <Link href="/auth" className="cursor-pointer">
                {/* 로그인 아이콘 */}
                <LoginIcon />
              </Link>
            )}
          </div>
        </div>

        {/* 두 번째 줄: 네비게이션 메뉴 */}
        <nav className="flex items-center space-x-6">
          <Link href="/category" className={getLinkClasses('/category')}>
            상영회
            {isActive('/category') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
          </Link>
          <Link href="/vote" className={getLinkClasses('/vote')}>
            수요조사
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
          <Link href="/" className="cursor-pointer">
            <img src="/cinemoa_logo_long.png" alt="씨네모아" className="w-[119px] h-full pb-1" />
          </Link>
          {/* navbar */}
          <nav className="flex items-center justify-center gap-x-8">
            <Link href="/category" className={getLinkClasses('/category')}>
              상영회
              {isActive('/category') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </Link>
            <Link href="/vote" className={getLinkClasses('/vote')}>
              수요조사
              {isActive('/vote') && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </Link>
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
            {pathname !== '/' && pathname !== '/home' && pathname !== '/search' && pathname !== '/search/start' && (
              <div className="relative flex-1 min-w-0 pr-3">
                <Input
                  type="text"
                  placeholder="검색어를 입력해주세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => router.push('/search/start')}
                  readOnly
                  className="h-8 bg-BG-1 placeholder:text-tertiary border-none rounded-[8px] pr-10 pl-3 cursor-pointer"
                />
                <Link href="/search/start" className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer pr-2">
                  <SearchIcon stroke="#94A3B8" width={20} height={20} />
                </Link>
              </div>
            )}
            {/* 로그인 상태일 시 */}
            {isClient && user && isLoggedIn() ? (
              <>
                {/* 알림 아이콘 */}
                <NotificationDropdown isMobile={false} />
                <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
                  <DialogTrigger asChild>
                    <button className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2cd8ce] to-[#ff5768] hover:from-[#2cd8ce] hover:to-[#e04e5f] flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[#71e5de]/25 relative overflow-hidden">
                      {/* 네온 글로우 효과 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#71e5de]/20 to-[#ff5768]/20 rounded-full"></div>
                      <TicketIcon height={20} width={20} />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md w-[90vw] max-h-[100vh] overflow-y-auto p-0 bg-transparent border-none shadow-none sm:w-full">
                    <DialogHeader variant="simple">
                      <VisuallyHidden>
                        <DialogTitle>스마트 티켓</DialogTitle>
                      </VisuallyHidden>
                    </DialogHeader>
                    <Ticket onClose={() => setIsTicketOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Link href="/mypage" className="flex-none cursor-pointer" onClick={handleMyPageClick}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userInfo?.profileImgUrl} />
                    <AvatarFallback />
                  </Avatar>
                </Link>
                {/* 출시될 때 마이페이지로 가기 */}
                <Button onClick={handleLogout} className="rounded-[99px]" variant="tertiary" size="sm" textSize="sm">
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
                  <Button className="w-full rounded-[99px] text-inverse" variant="primary" size="sm" textSize="sm">
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
