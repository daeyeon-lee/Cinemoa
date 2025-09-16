'use client';

import Image from 'next/image';
import { RecommendedSection } from './sections/RecommendedSection';
import { ClosingSoonSection } from './sections/ClosingSoonSection';
import { PopularSection } from './sections/PopularSection';
import { RecentlyViewedSection } from './sections/RecentlyViewedSection';
import { CategoryButton } from '@/components/buttons/CategoryButton';
import { Input } from '@/components/ui/input';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import type { ListCardData } from './types/listCardData';

const sampleCardData: ListCardData = {
  funding: {
    fundingId: 1,
    title: '샘플 영화를 봅시다',
    videoName: '샘플 영화',
    bannerUrl: '/images/image.png',
    state: 'ACTIVE',
    progressRate: 75,
    fundingEndsOn: '2024-12-31T23:59:59',
    screenDate: '2025-01-15T19:00:00',
    price: 15000,
    maxPeople: 200,
    participantCount: 150,
    favoriteCount: 89,
    isLiked: false,
    fundingType: 'FUNDING' as const,
  },
  cinema: {
    cinemaId: 1,
    cinemaName: 'CGV 강남',
    city: '서울',
    district: '강남구',
  },
};

export default function Home() {
  const recommendedItems = Array(10).fill(sampleCardData);
  const closingSoonItems = Array(10).fill(sampleCardData);
  const popularItems = Array(8).fill(sampleCardData);
  const recentlyViewedItems = Array(10).fill(sampleCardData);

  // 카테고리 데이터 (아이콘은 임시로 텍스트 사용, 실제로는 아이콘 컴포넌트 사용)
  const categories = [
    { name: '영화', icon: '🎬' },
    { name: '시리즈', icon: '📺' },
    { name: '공연', icon: '🎭' },
    { name: '스포츠중계', icon: '⚽' },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <main className="grid grid-cols-12 gap-6">
        {/* 로고+검색+카테고리 - Full Width */}
        <div className="col-span-12 py-8">
          {/* Desktop: 로고 + 검색 + 카테고리 */}
          <div className="hidden md:flex flex-col items-center gap-8">
            <Image
              src="/cinemoa_logo_long.png"
              alt="씨네모아 로고"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />

            <div className="flex flex-col items-center gap-2 w-full">
              <Input
                type="text"
                placeholder="보고 싶은 상영물을 검색해보세요!"
                className="w-full"
                style={{ width: `${categories.length * 130 + (categories.length - 1) * 12}px` }}
              />

              <div className="flex gap-1">
                {categories.map((category) => (
                  <CategoryButton
                    key={category.name}
                    icon={category.icon}
                    onClick={() => console.log(`${category.name} 선택됨`)}
                    containerBgClass="bg-BG-0"
                    uniformWidth={true}
                  >
                    {category.name}
                  </CategoryButton>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: 카테고리 버튼만 */}
          <div className="md:hidden">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-1 justify-center min-w-max">
                {categories.map((category) => (
                  <CategoryButton
                    key={category.name}
                    icon={category.icon}
                    isMobile={true}
                    onClick={() => console.log(`${category.name} 선택됨`)}
                    containerBgClass="bg-BG-0"
                    uniformWidth={true}
                    className="flex-shrink-0"
                  >
                    {category.name}
                  </CategoryButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-12">
          {/* Desktop Layout */}
          <div className="hidden md:grid grid-cols-12 gap-12">
            {/* Left Column - Recommended + Closing Soon */}
            <div className="col-span-8 space-y-12">
              <RecommendedSection title="추천 상영회" items={recommendedItems} loading={false} />

              <ClosingSoonSection
                title="종료 임박 상영회"
                items={closingSoonItems}
                loading={false}
                onMoreClick={() => console.log('종료 임박 더보기')}
              />
            </div>

            {/* Right Column - Popular */}
            <aside className="col-span-4 h-fit">
              <PopularSection title="인기 상영회" items={popularItems} loading={false} />
            </aside>
          </div>

          {/* Mobile Layout - Vertical Stack */}
          <div className="md:hidden space-y-8">
            <RecommendedSection title="추천 상영회" items={recommendedItems} loading={false} />

            <ClosingSoonSection
              title="종료 임박 상영회"
              items={closingSoonItems}
              loading={false}
              onMoreClick={() => console.log('종료 임박 더보기')}
            />

            <PopularSection title="인기 상영회" items={popularItems} loading={false} />

            <RecentlyViewedSection title="최근 본 상영회" items={recentlyViewedItems} loading={true} />
          </div>
        </div>

        {/* Recently Viewed - Full Width (Desktop Only) */}
        <section className="hidden md:block col-span-12 mt-4">
          <RecentlyViewedSection title="최근 본 상영회" items={recentlyViewedItems} loading={true} />
        </section>
      </main>
    </div>
  );
}
