"use client";

import SearchIcon from "@/component/icon/searchIcon";
import UserIcon from "@/component/icon/userIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
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
          <Link
            href="/category"
            className="text-tertiary text-h6 cursor-pointer"
          >
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
            <Link href="/" className="text-primary text-h6 cursor-pointer">
              홈
            </Link>
            <Link
              href="/category"
              className="text-primary text-h6 cursor-pointer"
            >
              둘러보기
            </Link>
            <Link href="/vote" className="text-primary text-h6 cursor-pointer">
              이거어때
            </Link>
            <Link
              href="/create"
              className="text-primary text-h6 cursor-pointer"
            >
              만들기
            </Link>
          </nav>
        </div>

        {/* 검색바 + 로그인/회원가입 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="검색..."
              className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-4 py-2 text-gray-300 hover:text-white"
              onClick={() => router.push("/signup")}
            >
              로그인
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => router.push("/signup")}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
