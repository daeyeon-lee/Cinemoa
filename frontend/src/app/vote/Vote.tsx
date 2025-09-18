'use client';

import React, { useState } from 'react';
import { ListShell } from '@/components/layouts/ListShell';
import { CategorySelectSection } from '@/components/filters/CategorySelectSection';
import { RegionFilterPanel } from '@/components/filters/RegionFilterPanel';
import { TheaterTypeFilterPanel } from '@/components/filters/TheaterTypeFilterPanel';
import { SortBar } from '@/components/filters/SortBar';
import { ResponsiveCardList } from '@/components/lists/ResponsiveCardList';
import type { CardItem } from '@/components/lists/ResponsiveCardList';
import { STANDARD_CATEGORIES } from '@/constants/categories';
import { REGIONS, THEATER_TYPES } from '@/constants/regions';
/**
 * 이거어때 페이지 컴포넌트
 *
 * @description 투표 프로젝트를 둘러볼 수 있는 페이지입니다.
 * ListShell을 기반으로 필터링과 정렬 기능을 제공하며, brand2 컬러를 사용합니다.
 */
export default function Vote() {
  // TODO: 실제 데이터 연결 필요
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTheaterType, setSelectedTheaterType] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [showClosed, setShowClosed] = useState<boolean>(false);

  const categories = STANDARD_CATEGORIES;
  const regions = REGIONS;
  const theaterTypes = THEATER_TYPES;

  // TODO: 실제 투표 카드 데이터로 교체 필요 - 더미 데이터
  const dummyItems: CardItem[] = [
    {
      funding: {
        fundingId: 1,
        title: '탑건: 매버릭 재상영 투표',
        bannerUrl: '/images/dummy-banner-3.jpg',
        state: 'ACTIVE',
        progressRate: 0, // 투표는 진행률 없음
        fundingEndsOn: '2024-01-20',
        screenDate: '2024-01-25',
        price: 0, // 투표는 가격 없음
        maxPeople: 0,
        participantCount: 0,
        favoriteCount: 125,
        isLiked: false,
        fundingType: 'VOTE',
      },
      cinema: {
        cinemaId: 3,
        cinemaName: '메가박스 코엑스',
        city: '서울',
        district: '강남구',
      },
    },
    {
      funding: {
        fundingId: 2,
        title: '인터스텔라 IMAX 상영 희망',
        bannerUrl: '/images/dummy-banner-4.jpg',
        state: 'ACTIVE',
        progressRate: 0,
        fundingEndsOn: '2024-01-22',
        screenDate: '2024-01-27',
        price: 0,
        maxPeople: 0,
        participantCount: 0,
        favoriteCount: 89,
        isLiked: true,
        fundingType: 'VOTE',
      },
      cinema: {
        cinemaId: 4,
        cinemaName: 'CGV 용산아이파크몰',
        city: '서울',
        district: '용산구',
      },
    },
  ];

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubCategories([]);
    setSelectedRegions([]);
    setSelectedTheaterType([]);
    setSortBy('latest');
    setShowClosed(false);
  };

  // 재시도 핸들러
  const handleRetry = () => {
    // TODO: 데이터 재로딩 로직 구현
    console.log('재시도 중...');
  };

  // 카드 클릭 핸들러
  const handleCardClick = (id: number) => {
    // TODO: 투표 상세 페이지 이동 로직 구현
    console.log('투표 카드 클릭:', id);
  };

  // 투표 클릭 핸들러
  const handleVoteClick = (id: number) => {
    // TODO: 투표 토글 로직 구현
    console.log('투표 클릭:', id);
  };

  return (
    <ListShell
      header={
        <CategorySelectSection
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSubCategories={selectedSubCategories}
          onSubCategoryChange={setSelectedSubCategories}
          variant="brand2"
        />
      }
      sidebar={
        <div className="space-y-10">
          {/* 지역 필터 */}
          <RegionFilterPanel
            regions={regions}
            value={selectedRegions}
            onChange={setSelectedRegions}
            onReset={() => setSelectedRegions([])}
            variant="brand2"
          />

          {/* 상영관 타입 필터 */}
          <TheaterTypeFilterPanel
            types={theaterTypes}
            value={selectedTheaterType}
            onChange={setSelectedTheaterType}
            onReset={() => setSelectedTheaterType([])}
            variant="brand2"
          />
        </div>
      }
      content={
        <div className="space-y-3">
          {/* 정렬 바 */}
          <SortBar sortBy={sortBy} onSortChange={setSortBy} isClosed={showClosed} onIsClosedChange={setShowClosed} />

          {/* 카드 목록 */}
          <ResponsiveCardList
            items={dummyItems}
            mode="vote"
            loading={false}
            empty={false}
            error={false}
            onCardClick={handleCardClick}
            onVoteClick={handleVoteClick}
            onResetFilters={handleResetFilters}
            onRetry={handleRetry}
          />
        </div>
      }
    />
  );
}
