import SearchIcon from '@/component/icon/searchIcon';
import UserIcon from '@/component/icon/userIcon';
import Link from 'next/link';
import Button from '@/component/button/button';
import SearchInput from '@/component/search/SearchInput';

export default function Navbar() {
  return (
    <header className="bg-slate-900 border-b border-slate-900 py-3 pt-[108px] lg:pt-3">
      {/* 모바일 레이아웃 - 두 줄 */}
      <div className="lg:hidden">
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
          <Link href="/" className="text-tertiary text-h6 cursor-pointer">
            홈
          </Link>
          <Link href="/category" className="text-tertiary text-h6 cursor-pointer">
            둘러보기
          </Link>
          <Link href="/vote" className="text-tertiary text-h6 cursor-pointer">
            이거어때
          </Link>
          <Link href="/create" className="text-tertiary text-h6 cursor-pointer">
            만들기
          </Link>
        </nav>
      </div>

      {/* 데스크톱 레이아웃 - 한 줄 */}
      <div className="hidden lg:flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center justify-center gap-16">
          <img src="/cinemoa_logo_long.png" alt="씨네모아" className="h-8" />

          {/* 네비게이션 메뉴 */}
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-tertiary text-h6 cursor-pointer">
              홈
            </Link>
            <Link href="/category" className="text-tertiary text-h6 cursor-pointer">
              둘러보기
            </Link>
            <Link href="/vote" className="text-tertiary text-h6 cursor-pointer">
              이거어때
            </Link>
            <Link href="/create" className="text-tertiary text-h6 cursor-pointer">
              만들기
            </Link>
          </nav>
        </div>

        {/* 검색바 + 로그인/회원가입 */}
        <div className="flex items-center space-x-4">
          <div className="flex w-full items-center space-x-2">
            <Button color="secondary" text="로그인" size="sm" />
            <Button color="primary" text="회원가입" size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
