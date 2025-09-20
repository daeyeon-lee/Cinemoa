'use client';

import Image from 'next/image';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 상영회 목록 섹션
import { RecommendedSection } from './sections/RecommendedSection';
import { ClosingSoonSection } from './sections/ClosingSoonSection';
import { PopularSection } from './sections/PopularSection';
import { RecentlyViewedSection } from './sections/RecentlyViewedSection';
// 상단(로고+검색창+카테고리버튼)
import { CategoryButton } from '@/components/buttons/CategoryButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchIcon from '@/component/icon/searchIcon';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import { HOME_CATEGORIES } from '@/constants/categories';
// 버튼 클릭 시 둘러보기 페이지 이동
import { navigateToCategory } from '@/utils/categoryNavigation';
import { useHomeRecommended } from '@/hooks/queries/useHomeRecommended';
import { useHomePopular } from '@/hooks/queries/useHomePopular';
import { useHomeClosingSoon } from '@/hooks/queries/useHomeClosingSoon';
// 유저아이디
import { useAuthStore } from '@/stores/authStore';
import type { ApiSearchItem } from '@/types/searchApi';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Auth Store에서 사용자 정보 가져오기
  const { user } = useAuthStore();

  // 🐛 디버깅: 컴포넌트에서 authStore 상태 확인
  useEffect(() => {
    console.log('[DEBUG Home] useAuthStore 상태:', user);
    console.log('[DEBUG Home] authStore 전체 상태:', useAuthStore.getState());
    console.log('[DEBUG Home] 로그인 여부:', user ? '로그인됨' : '비로그인');

    // localStorage 직접 확인
    const storedAuth = localStorage.getItem('auth-storage');
    console.log('[DEBUG Home] localStorage auth-storage:', storedAuth);

    // 쿠키 확인
    console.log('[DEBUG Home] 현재 쿠키들:', document.cookie);

    // 세션 쿠키 체크
    const hasSessionCookie = document.cookie.includes('JSESSIONID');
    console.log('[DEBUG Home] JSESSIONID 쿠키 존재:', hasSessionCookie);
  }, [user]);

  // React Query 훅들 - authStore에서 자동으로 userId 가져옴
  const { data: recommendedItems = [], isLoading: isLoadingRecommended } = useHomeRecommended();
  const { data: popularItems = [], isLoading: isLoadingPopular } = useHomePopular();
  const { data: closingSoonItems = [], isLoading: isLoadingClosingSoon } = useHomeClosingSoon();
  // const recentlyViewedItems = Array(10).fill(sampleCardData);

  // TODO: 실제 투표 카테고리 데이터로 교체 필요
  const categories = HOME_CATEGORIES;

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

  // 카드 클릭 핸들러 - 상세페이지로 이동
  const handleCardClick = useCallback(
    (fundingId: number) => {
      router.push(`/detail/${fundingId}`);
    },
    [router],
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <main className="gap-5">
        {/* Desktop: 로고+검색+카테고리 - Full Width */}
        <div className="hidden sm:block py-8">
          <div className="flex flex-col items-center gap-8 w-full">
            <Image src="/cinemoa_logo_long.png" alt="씨네모아 로고" width={196} height={40} />

            <div className="flex flex-col items-center gap-3 w-full">
              {/* 검색어 입력 */}
              <div className="w-full max-w-2xl flex items-center gap-2">
                <Input
                  placeholder="보고싶은 상영물을 입력해주세요."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 h-14 px-8 !text-lg !text-primary placeholder:!text-lg placeholder:!text-subtle"
                />
                <Button variant="ghost" className="hover:bg-BG-0" onClick={handleSearch}>
                  <SearchIcon width={34} height={34} stroke="#cbd5e1" />
                </Button>
              </div>
              {/* 카테고리 버튼들 */}
              <div className="flex flex-wrap justify-center gap-1">
                {categories.map((category) => (
                  <CategoryButton
                    key={category.value}
                    icon={category.icon}
                    categoryValue={category.value}
                    page="home"
                    uniformWidth={true}
                    onClick={() => navigateToCategory({ categoryId: category.categoryId ?? undefined })}
                  >
                    {category.label}
                  </CategoryButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: 카테고리 버튼 상단 배치 */}
        <div className="sm:hidden py-4">
          <HorizontalScroller>
            <div className="flex gap-1">
              {categories.map((category) => (
                <CategoryButton
                  key={category.value}
                  icon={category.icon}
                  categoryValue={category.value}
                  page="home"
                  uniformWidth={true}
                  onClick={() => navigateToCategory({ categoryId: category.categoryId ?? undefined })}
                >
                  {category.label}
                </CategoryButton>
              ))}
            </div>
          </HorizontalScroller>
        </div>

        {/* Desktop Layout - 웹 버전 */}
        <div className="hidden sm:block">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Recommended + Closing Soon */}
            <div className="lg:col-span-8 space-y-12">
              <RecommendedSection title="추천 상영회" items={recommendedItems} loading={isLoadingRecommended} onCardClick={handleCardClick} />
              <ClosingSoonSection title="종료 임박 상영회" items={closingSoonItems} loading={isLoadingClosingSoon} onMoreClick={() => console.log('종료 임박 더보기')} onCardClick={handleCardClick} />
            </div>

            {/* Right Column - Popular */}
            <aside className="lg:col-span-4 h-fit w-full">
              <PopularSection title="인기 상영회" items={popularItems} loading={isLoadingPopular} onCardClick={handleCardClick} />
            </aside>
          </div>
        </div>

        {/* Mobile Layout - 모바일 버전 세로 스택 */}
        <div className="sm:hidden space-y-8">
          <RecommendedSection title="추천 상영회" items={recommendedItems} loading={isLoadingRecommended} onCardClick={handleCardClick} />
          <PopularSection title="인기 상영회" items={popularItems} loading={isLoadingPopular} onCardClick={handleCardClick} />
          <ClosingSoonSection title="종료 임박 상영회" items={closingSoonItems} loading={isLoadingClosingSoon} onMoreClick={() => console.log('종료 임박 더보기')} onCardClick={handleCardClick} />
        </div>

        {/* Recently Viewed - Full Width (Desktop Only) */}
        <section className="hidden sm:block mt-4">{/* <RecentlyViewedSection title="최근 본 상영회" loading={true} /> */}</section>
      </main>
    </div>
  );
}
