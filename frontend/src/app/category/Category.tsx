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
 * 둘러보기 페이지 컴포넌트
 *
 * @description 카테고리별 펀딩 프로젝트를 둘러볼 수 있는 페이지입니다.
 * ListShell을 기반으로 필터링과 정렬 기능을 제공합니다.
 */
export default function Category() {
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

  // TODO: 실제 카드 데이터로 교체 필요 - 더미 데이터
  const dummyItems: CardItem[] = [
    {
      funding: {
        fundingId: 1,
        title: '어벤져스: 엔드게임 스페셜 상영',
        bannerUrl: '/images/dummy-banner-1.jpg',
        state: 'ACTIVE',
        progressRate: 75,
        fundingEndsOn: '2024-01-15',
        screenDate: '2024-01-20',
        price: 15000,
        maxPeople: 100,
        participantCount: 75,
        favoriteCount: 45,
        isLiked: false,
        fundingType: 'FUNDING',
      },
      cinema: {
        cinemaId: 1,
        cinemaName: 'CGV 강남점',
        city: '서울',
        district: '강남구',
      },
    },
    {
      funding: {
        fundingId: 2,
        title: '기생충 4DX 체험',
        bannerUrl: '/images/dummy-banner-2.jpg',
        state: 'ACTIVE',
        progressRate: 60,
        fundingEndsOn: '2024-01-18',
        screenDate: '2024-01-25',
        price: 25000,
        maxPeople: 50,
        participantCount: 30,
        favoriteCount: 28,
        isLiked: true,
        fundingType: 'FUNDING',
      },
      cinema: {
        cinemaId: 2,
        cinemaName: '롯데시네마 월드타워',
        city: '서울',
        district: '송파구',
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
    // TODO: 상세 페이지 이동 로직 구현
    console.log('카드 클릭:', id);
  };

  // 투표/좋아요 클릭 핸들러
  const handleVoteClick = (id: number) => {
    // TODO: 좋아요 토글 로직 구현
    console.log('좋아요 클릭:', id);
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
          variant="brand1"
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
          />

          {/* 상영관 타입 필터 */}
          <TheaterTypeFilterPanel
            types={theaterTypes}
            value={selectedTheaterType}
            onChange={setSelectedTheaterType}
            onReset={() => setSelectedTheaterType([])}
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
            mode="funding"
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
