'use client';

import Image from 'next/image';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
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
import { useHomeRecentlyViewed } from '@/hooks/queries/useHomeRecentlyViewed';
import { useFundingLike } from '@/hooks/queries/useFunding'; // ✅ 동일 훅 import
// 유저아이디
import { useAuthStore } from '@/stores/authStore';
import type { ApiSearchItem } from '@/types/searchApi';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient(); // ✅ React Query 클라이언트 접근

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
  const { data: recentlyViewedData, isLoading: isLoadingRecentlyViewed } = useHomeRecentlyViewed();
  const recentlyViewedItems = recentlyViewedData?.data || [];
  const { mutate: toggleLike } = useFundingLike(); // ✅ 좋아요 토글 훅

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

  // ❤️ 좋아요 클릭 핸들러
  const handleVoteClick = useCallback(
    (fundingId: number) => {
      if (!user?.userId) {
        // 비로그인 처리 (로그인 유도 등)
        console.log('🔐 로그인 필요');
        return;
      }

      // 1) 현재 홈/검색 캐시들에서 해당 카드의 isLiked를 찾아냄
      const queries = queryClient.getQueriesData({ queryKey: ['home'] });
      const searchQueries = queryClient.getQueriesData({ queryKey: ['search'] });
      const allQueries = [...queries, ...searchQueries];
      let currentIsLiked: boolean | null = null;

      for (const [, data] of allQueries) {
        if (!data) continue;

        // 홈 섹션 데이터 구조 확인
        if (Array.isArray(data)) {
          // 홈 섹션 데이터 (ApiSearchItem[])
          for (const item of data) {
            const id = Number(item?.funding?.fundingId ?? item?.fundingId);
            if (id === fundingId) {
              currentIsLiked = (item?.funding?.isLiked ?? item?.funding?.stat?.isLiked) === true;
              break;
            }
          }
        } else {
          // 검색 데이터 구조 (무한스크롤 or 단일 페이지)
          const pages = Array.isArray((data as any)?.pages) ? (data as any).pages : [data];
          for (const page of pages) {
            const content = page?.data?.content ?? page?.content;
            if (!Array.isArray(content)) continue;

            for (const item of content) {
              const id = Number(item?.funding?.fundingId ?? item?.fundingId);
              if (id === fundingId) {
                currentIsLiked = (item?.funding?.isLiked ?? item?.funding?.stat?.isLiked) === true;
                break;
              }
            }
            if (currentIsLiked !== null) break;
          }
        }
        if (currentIsLiked !== null) break;
      }

      // 2) 못 찾았으면 보수적으로 false로 간주
      const safeIsLiked = currentIsLiked ?? false;

      console.log('❤️ [Home] 좋아요 토글:', { fundingId, currentIsLiked: safeIsLiked });

      // 3) 토글 실행 (공통 훅: 목록/상세 모두 같은 낙관적 업데이트 로직 공유)
      toggleLike({
        fundingId,
        userId: String(user.userId),
        isLiked: safeIsLiked,
      });
    },
    [user?.userId, queryClient, toggleLike]
  );

  // ✅ bfcache 복원 시 홈/검색 쿼리 강제 갱신
  useEffect(() => {
    // pageshow: 뒤로가기 복원(bfcache)까지 포착하는 이벤트
    const handlePageShow = (e: PageTransitionEvent) => {
      // e.persisted === true 이면 bfcache에서 복원된 것
      if (e.persisted) {
        console.log('🔄 [Home] bfcache 복원 감지 - 쿼리 무효화');
        // 🔄 홈/검색 쿼리 무효화 → refetch 트리거
        queryClient.invalidateQueries({ queryKey: ['home'] });   // 홈 섹션들
        queryClient.invalidateQueries({ queryKey: ['search'] }); // 검색 쿼리들
      }
    };

    // 탭 비활성 → 활성 전환 시도도 안전망으로 갱신
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ [Home] 탭 활성화 감지 - 쿼리 무효화');
        queryClient.invalidateQueries({ queryKey: ['home'] });
        queryClient.invalidateQueries({ queryKey: ['search'] });
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [queryClient]);

  return (
    <div className="w-full px-5">
      <main className="gap-5">
        {/* Desktop: 로고+검색+카테고리 - Full Width */}
        <div className="hidden sm:block py-8">
          <div className="flex flex-col items-center gap-8 w-full">
            <Image src="/cinemoa_logo_long.png" alt="씨네모아 로고" width={196} height={40} priority />

            <div className="flex flex-col items-center gap-3 w-full">
              {/* 검색어 입력 */}
              <div className="w-[588px] relative">
                <Input
                  placeholder="보고싶은 상영물을 입력해주세요."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-14 pl-8 pr-16 !text-lg !text-primary placeholder:!text-lg placeholder:!text-subtle"
                />
                <Button variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-BG-1" onClick={handleSearch}>
                  <SearchIcon width={24} height={24} stroke="#cbd5e1" />
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
        <div className="sm:hidden py-4 flex justify-center">
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

        {/* Desktop Layout - 웹 버전 (lg 이상) */}
        <div className="hidden lg:block">
          {/* 첫 번째 행: 추천 상영회 | 인기 상영회 */}
          <div className="w-full flex flex-col gap-4 lg:flex-row lg:gap-8 mb-12">
            {/* Left Column - Recommended (2/3) */}
            <div className="flex-1 lg:w-2/3">
              <RecommendedSection title="추천 상영회" items={recommendedItems} loading={isLoadingRecommended} onCardClick={handleCardClick} onVoteClick={handleVoteClick} />
            </div>

            {/* Right Column - Popular (1/3) */}
            <aside className="lg:w-1/3 h-fit">
              <PopularSection title="인기 상영회" items={popularItems} loading={isLoadingPopular} onCardClick={handleCardClick} onVoteClick={handleVoteClick} />
            </aside>
          </div>

          {/* 두 번째 행: 종료 임박 상영회 - Full Width */}
          <div className="w-full mb-12">
            <ClosingSoonSection title="종료 임박 상영회" items={closingSoonItems} loading={isLoadingClosingSoon} onMoreClick={() => console.log('종료 임박 더보기')} onCardClick={handleCardClick} onVoteClick={handleVoteClick} />
          </div>

          {/* 세 번째 행: 최근 본 상영회 - Full Width */}
          <div>
            <RecentlyViewedSection title="최근 본 상영회" items={recentlyViewedItems} loading={isLoadingRecentlyViewed} onCardClick={handleCardClick} onVoteClick={handleVoteClick} />
          </div>
        </div>

        {/* Mobile/Tablet Layout - 한 줄씩 세로 스택 (lg 미만) */}
        <div className="lg:hidden space-y-8">
          <PopularSection title="인기 상영회" items={popularItems} loading={isLoadingPopular} onCardClick={handleCardClick} onVoteClick={handleVoteClick} />
          <RecommendedSection title="추천 상영회" items={recommendedItems} loading={isLoadingRecommended} onCardClick={handleCardClick} onVoteClick={handleVoteClick} />
          <ClosingSoonSection title="종료 임박 상영회" items={closingSoonItems} loading={isLoadingClosingSoon} onMoreClick={() => console.log('종료 임박 더보기')} onCardClick={handleCardClick} onVoteClick={handleVoteClick} />
          <RecentlyViewedSection title="최근 본 상영회" items={recentlyViewedItems} loading={isLoadingRecentlyViewed} onCardClick={handleCardClick} onVoteClick={handleVoteClick} />
        </div>
      </main>
    </div>
  );
}
