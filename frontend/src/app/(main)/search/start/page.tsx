'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchIcon from '@/component/icon/searchIcon';
import { X } from 'lucide-react';

export default function SearchStartPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 실행 핸들러
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 엔터키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ESC 키로 뒤로가기
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      router.back();
    }
  };

  // ESC 키 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // 배경 클릭 시 뒤로가기
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-BG-0 flex justify-center" onClick={handleBackgroundClick}>
      {/* 웹화면 컨테이너 - 최대 1200px */}
      <div className="w-full max-w-[1200px] relative pt-32 px-4 md:px-12">
        {/* X 버튼 */}
        <Button onClick={() => router.back()} variant="ghost" size="lg" className="absolute top-4 right-4 rounded-full p-2">
          <X size={32} className="text-tertiary" />
        </Button>

        {/* 검색창 컨테이너 */}
        <div className="w-full max-w-md mx-auto">
          {/* 검색창 */}
          <div className="w-full max-w-2xl mx-auto flex items-center">
            <Input
              type="search"
              placeholder="검색어 입력하기"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="ghost" className="hover:bg-BG-0">
              <SearchIcon width={24} height={24} stroke="#cbd5e1" className="md:w-9 md:h-9" />
            </Button>
          </div>

          {/* 안내 텍스트 */}
        </div>
      </div>
    </div>
  );
}
