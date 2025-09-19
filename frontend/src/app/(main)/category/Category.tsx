'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListShell } from '@/components/layouts/ListShell';
import { CategorySelectSection } from '@/components/filters/CategorySelectSection';
import { RegionFilterPanel } from '@/components/filters/RegionFilterPanel';
import { TheaterTypeFilterPanel } from '@/components/filters/TheaterTypeFilterPanel';
import { SortBar } from '@/components/filters/SortBar';
import { ResponsiveCardList } from '@/components/lists/ResponsiveCardList';
import type { CardItem } from '@/components/lists/ResponsiveCardList';
import { STANDARD_CATEGORIES, findCategoryValueById, type CategoryValue } from '@/constants/categories';
import { REGIONS, THEATER_TYPES } from '@/constants/regions';
import { useSearch } from '@/hooks/queries/useSearch';
import type { SearchParams, SortBy } from '@/types/searchApi';
/**
 * 둘러보기 페이지 컴포넌트
 *
 * @description 카테고리별 펀딩 프로젝트를 둘러볼 수 있는 페이지입니다.
 * ListShell을 기반으로 필터링과 정렬 기능을 제공합니다.
 */
export default function Category() {
  console.log('🎯 [Category] 컴포넌트 렌더링');
  const router = useRouter();

  // 필터 상태 관리 (categoryId 기반)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null); // 1차 카테고리 ID
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue | null>('all'); // UI용 categoryValue
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null); // 세부카테고리 ID (단일)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTheaterType, setSelectedTheaterType] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('LATEST');
  const [showClosed, setShowClosed] = useState<boolean>(false);

  // localStorage에서 categoryId 읽어서 설정
  useEffect(() => {
    const savedCategoryId = localStorage.getItem('selectedCategoryId');

    if (savedCategoryId) {
      const categoryId = parseInt(savedCategoryId, 10);
      console.log('🎯 [Category] localStorage에서 categoryId 감지:', categoryId);

      // 1차 카테고리 선택 (ex: categoryId=1이면 영화 전체 선택)
      setSelectedCategoryId(categoryId);
      setSelectedSubCategory(categoryId);

      // UI용 categoryValue 설정
      const categoryValue = findCategoryValueById(categoryId);
      if (categoryValue) {
        setSelectedCategory(categoryValue);
      }

      console.log('✅ [Category] 카테고리 초기화 완료:', {
        selectedCategoryId: categoryId,
        selectedCategory: categoryValue,
        selectedSubCategory: categoryId,
      });

      // 사용 후 localStorage 정리
      localStorage.removeItem('selectedCategoryId');
    }
  }, []);

  const categories = STANDARD_CATEGORIES;
  const regions = REGIONS;
  const theaterTypes = THEATER_TYPES;

  // 🔍 useSearch 훅으로 API 데이터 조회 - 사용자가 선택한 것만 전달
  const searchParams = useMemo(() => {
    const params: SearchParams = {
      fundingType: 'FUNDING' as const, // 둘러보기는 펀딩만
    };

    // 사용자가 정렬을 변경했을 때만 전달 (기본값: LATEST)
    if (sortBy !== 'LATEST') {
      params.sortBy = sortBy;
    }

    // 카테고리 선택 로직 (단일 값만 전달)
    if (selectedCategory === 'all') {
      // 1차 "전체" 선택: category 파라미터 없음 (모든 카테고리)
      // params.category는 추가하지 않음
    } else if (selectedSubCategory !== null) {
      // 세부 카테고리 선택: 선택된 카테고리 전달
      params.category = selectedSubCategory;
    } else if (selectedCategory) {
      // 1차 카테고리 선택했지만 서브카테고리 선택 안함 (예: "영화-전체")
      const categoryInfo = categories.find((cat) => cat.value === selectedCategory);
      if (categoryInfo?.categoryId) {
        params.category = categoryInfo.categoryId;
      }
    }

    // 사용자가 지역을 선택했을 때만 전달 (기본값: 전체)
    if (selectedRegions.length > 0) {
      params.region = selectedRegions[0];
    }

    // 사용자가 상영관 타입을 선택했을 때만 전달 (기본값: 전체)
    // selectedTheaterType에는 한글 label이 들어있으므로 백엔드용 value로 변환
    if (selectedTheaterType.length > 0) {
      const theaterValues = selectedTheaterType
        .map((label) => theaterTypes.find((type) => type.label === label)?.value)
        .filter(Boolean);
      if (theaterValues.length > 0) {
        params.theaterType = theaterValues as string[];
      }
    }

    // 사용자가 종료된 상영회 포함을 체크했을 때만 전달 (기본값: false)
    if (showClosed) {
      params.isClosed = showClosed;
    }

    console.log('📤 [Category] API 파라미터 (선택된 것만):', params);
    return params;
  }, [
    sortBy,
    selectedCategory,
    selectedSubCategory,
    selectedRegions,
    selectedTheaterType,
    showClosed,
    categories,
    theaterTypes,
  ]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useSearch(searchParams);

  const items = data?.content || [];

  console.log('📊 [Category] 현재 데이터 상태:', {
    itemsCount: items.length,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: !!error,
  });

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedCategoryId(null);
    setSelectedSubCategory(null);
    setSelectedRegions([]);
    setSelectedTheaterType([]);
    setSortBy('LATEST');
    setShowClosed(false);
  };

  // 🔄 재시도 핸들러
  const handleRetry = useCallback(() => {
    console.log('🔄 [Category] 재시도 버튼 클릭');
    refetch();
  }, [refetch]);

  // 🔄 무한 스크롤 핸들러
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📋 [Category] 다음 페이지 로드');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 🖱️ 카드 클릭 핸들러
  const handleCardClick = useCallback((id: number) => {
    console.log('🎯 [Category] 펀딩 카드 클릭:', id);
    router.push(`/detail/${id}`);
  }, [router]);

  // ❤️ 좋아요 클릭 핸들러
  const handleVoteClick = useCallback((id: number) => {
    console.log('❤️ [Category] 좋아요 버튼 클릭:', id);
    // TODO: 좋아요 토글 로직 구현
  }, []);

  return (
    <ListShell
      header={
        <CategorySelectSection
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSubCategory={selectedSubCategory}
          onSubCategoryChange={setSelectedSubCategory}
          variant="brand1"
        />
      }
      sidebar={
        <div className="space-y-10">
          {/* 지역 필터 */}
          <RegionFilterPanel regions={regions} value={selectedRegions} onChange={setSelectedRegions} onReset={() => setSelectedRegions([])} />

          {/* 상영관 타입 필터 */}
          <TheaterTypeFilterPanel types={theaterTypes} value={selectedTheaterType} onChange={setSelectedTheaterType} onReset={() => setSelectedTheaterType([])} />
        </div>
      }
      content={
        <div className="space-y-3">
          {/* 정렬 바 */}
          <SortBar sortBy={sortBy} onSortChange={setSortBy} isClosed={showClosed} onIsClosedChange={setShowClosed} />

          {/* 카드 목록 */}
          <ResponsiveCardList
            items={items}
            mode="funding"
            loading={isLoading}
            empty={!isLoading && items.length === 0}
            error={!!error}
            onCardClick={handleCardClick}
            onVoteClick={handleVoteClick}
            onResetFilters={handleResetFilters}
            onRetry={handleRetry}
            // onLoadMore={handleLoadMore}
            // hasNextPage={hasNextPage}
            // isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      }
    />
  );
}
