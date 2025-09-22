'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ui
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { ListShell } from '@/components/layouts/ListShell';
import { CategorySelectSection } from '@/components/filters/CategorySelectSection';
import { CategoryButtonGroup } from '@/components/filters/CategoryButtonGroup';
import { CategoryButton } from '@/components/buttons/CategoryButton';
import { CategoryBottomSheetContent } from '@/components/filters/CategoryBottomSheetContent';
import { RegionFilterPanel } from '@/components/filters/RegionFilterPanel';
import { TheaterTypeFilterPanel } from '@/components/filters/TheaterTypeFilterPanel';
import { SortBar } from '@/components/filters/SortBar';
import { ResponsiveCardList } from '@/components/lists/ResponsiveCardList';
import { FilterBottomSheet } from '@/components/sheets/FilterBottomSheet';
//type, 상수
import { STANDARD_CATEGORIES, findCategoryValueById, type CategoryValue } from '@/constants/categories';
import { REGIONS, THEATER_TYPES } from '@/constants/regions';
//api 관련
import { useAuthStore } from '@/stores/authStore';
import { useSearch } from '@/hooks/queries/useSearch';
import type { SearchParams, SortBy } from '@/types/searchApi';
/**
 * 둘러보기 페이지 컴포넌트
 *
 * @description 카테고리별 펀딩 프로젝트를 둘러볼 수 있는 페이지입니다.
 * ListShell을 기반으로 필터링과 정렬 기능을 제공하며, 모바일에서는 바텀시트 UI를 제공합니다.
 *
 * @features
 * - 반응형 레이아웃: 데스크톱(사이드바 필터) vs 모바일(바텀시트 필터)
 * - 무한스크롤: 사용자가 스크롤하면 자동으로 다음 페이지 로드(웹, 모바일 공통)
 * - 실시간 필터링: 카테고리, 지역, 상영관 종류별 필터링
 * - 정렬 기능: 최신순, 인기순, 조회수순
 * - localStorage 연동: 다른 페이지에서 선택된 카테고리 자동 적용
 */
export default function Category() {
  console.log('🎯 [Category] 컴포넌트 렌더링');
  const router = useRouter();
  const { user } = useAuthStore();

  // ========== 필터 상태 관리 ==========
  // 카테고리 관련 상태들 (3개의 상태로 분리하여 정확한 추적)
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(null); // 선택된 1차 카테고리 ID (1=영화, 2=시리즈, 3=공연, 4=스포츠중계)
  const [selectedUiCategoryId, setSelectedUiCategoryId] = useState<number | null>(null); // UI 표시용 카테고리 ID (null=전체, 1=영화, 2=시리즈, etc.)
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null); // 선택된 세부카테고리 ID (2차 카테고리)

  // 지역 및 상영관 필터 상태들
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]); // 선택된 지역 배열 (현재는 단일 선택)
  const [selectedTheaterType, setSelectedTheaterType] = useState<string[]>([]); // 선택된 상영관 종류 배열

  // 정렬 및 옵션 상태들
  const [sortBy, setSortBy] = useState<SortBy>('LATEST'); // 정렬 기준 (LATEST, POPULAR, DEADLINE, etc.)
  const [showClosed, setShowClosed] = useState<boolean>(false); // 마감된 펀딩 포함 여부

  // ========== 모바일 바텀시트 상태 관리 ==========
  // 현재 활성화된 바텀시트 종류를 추적 (null이면 모든 바텀시트 닫힘)
  const [activeBottomSheet, setActiveBottomSheet] = useState<'category' | 'region' | 'theater' | null>(null);

  // ========== 초기화: localStorage에서 카테고리 정보 복원 ==========
  // 다른 페이지(홈, 검색 등)에서 카테고리를 선택하고 이 페이지로 왔을 때 해당 카테고리를 자동 선택
  useEffect(() => {
    const savedCategoryId = localStorage.getItem('selectedCategoryId');

    if (savedCategoryId) {
      const categoryId = parseInt(savedCategoryId, 10);
      console.log('🎯 [Category] localStorage에서 categoryId 감지:', categoryId);

      // 1차 카테고리 선택 (ex: categoryId=1이면 영화 전체 선택)
      // ID 1=영화, 2=시리즈, 3=공연, 4=스포츠중계
      setSelectedMainCategoryId(categoryId);
      setSelectedUiCategoryId(categoryId);
      setSelectedSubCategoryId(categoryId);

      console.log('✅ [Category] 카테고리 초기화 완료:', {
        selectedMainCategoryId: categoryId,
        selectedUiCategoryId: categoryId,
        selectedSubCategoryId: categoryId,
      });

      // 사용 후 localStorage 정리 (일회성 사용)
      localStorage.removeItem('selectedCategoryId');
    }
  }, []);

  // ========== 상수 데이터 정의 ==========
  const categories = STANDARD_CATEGORIES; // 전체, 영화, 시리즈, 공연, 스포츠중계 등의 카테고리 목록
  const regions = REGIONS; // 서울, 부산, 대구 등의 지역 목록
  const theaterTypes = THEATER_TYPES; // 일반, IMAX, 4DX 등의 상영관 종류 목록

  // ========== API 요청 파라미터 생성 ==========
  // 사용자가 선택한 필터 조건들을 API 요청용 파라미터로 변환
  // useMemo를 사용하여 불필요한 재계산 방지 및 성능 최적화
  const searchParams = useMemo(() => {
    const params: SearchParams = {
      fundingType: 'FUNDING' as const, // 둘러보기 페이지는 FUNDING 타입만 조회 (VOTE와 구분)
      userId: user?.userId ? Number(user.userId) : undefined, // 로그인한 사용자의 좋아요 정보 포함
    };

    // 정렬 조건: 기본값(LATEST)이 아닐 때만 API에 전달
    if (sortBy !== 'LATEST') {
      params.sortBy = sortBy;
    }

    // ========== 카테고리 필터링 로직 ==========
    if (selectedUiCategoryId === null) {
      // "전체" 선택: category 파라미터를 전달하지 않음 → 모든 카테고리 조회
    } else if (selectedSubCategoryId !== null) {
      // 2차 카테고리가 선택된 경우: 해당 세부 카테고리만 조회
      params.category = selectedSubCategoryId;
    } else if (selectedMainCategoryId !== null) {
      // 1차 카테고리만 선택된 경우: 해당 카테고리 전체 조회
      params.category = selectedMainCategoryId;
    }

    // ========== 지역 필터링 ==========
    // 현재는 단일 선택만 지원 (배열의 첫 번째 요소만 사용)
    if (selectedRegions.length > 0) {
      params.region = selectedRegions[0];
    }

    // ========== 상영관 종류 필터링 ==========
    // UI에서는 한글 라벨을 사용하지만 API에는 영문 value를 전달
    if (selectedTheaterType.length > 0) {
      const theaterValues = selectedTheaterType.map((label) => theaterTypes.find((type) => type.label === label)?.value).filter(Boolean); // undefined 제거
      if (theaterValues.length > 0) {
        params.theaterType = theaterValues as string[];
      }
    }

    // ========== 마감된 펀딩 포함 여부 ==========
    // 기본값(false)이 아닐 때만 API에 전달
    if (showClosed) {
      params.isClosed = showClosed;
    }
    return params;
  }, [sortBy, selectedUiCategoryId, selectedMainCategoryId, selectedSubCategoryId, selectedRegions, selectedTheaterType, showClosed, categories, theaterTypes, user?.userId]);

  // ========== 데이터 조회 및 무한스크롤 ==========
  // useSearch 훅을 통한 API 데이터 조회 (React Query 기반 무한스크롤)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useSearch(searchParams);

  // API에서 받아온 모든 페이지의 아이템들을 평탄화한 배열
  const items = data?.content || [];

  // 디버깅용 현재 상태 로깅
  console.log('📊 [Category] 현재 데이터 상태:', {
    data,
    error: !!error,
  });

  // ========== 이벤트 핸들러들 ==========

  /**
   * 필터 초기화 핸들러
   * 모든 필터 조건을 기본값으로 되돌림
   */
  const handleResetFilters = () => {
    setSelectedMainCategoryId(null);
    setSelectedUiCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedRegions([]);
    setSelectedTheaterType([]);
    setSortBy('LATEST');
    setShowClosed(false);
  };

  /**
   * API 재시도 핸들러
   * 네트워크 오류나 서버 오류 시 데이터 다시 불러오기
   */
  const handleRetry = useCallback(() => {
    console.log('🔄 [Category] 재시도 버튼 클릭');
    refetch();
  }, [refetch]);

  /**
   * 무한스크롤 로드 더보기 핸들러
   * 사용자가 "더보기" 버튼을 클릭하거나 자동 트리거 시 다음 페이지 로드
   */
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📋 [Category] 다음 페이지 로드');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * 펀딩 카드 클릭 핸들러
   * 해당 펀딩의 상세 페이지로 이동
   */
  const handleCardClick = useCallback(
    (id: number) => {
      router.push(`/detail/${id}`);
    },
    [router],
  );

  /**
   * 좋아요(하트) 버튼 클릭 핸들러
   * TODO: 실제 좋아요 API 연동 필요
   */
  const handleVoteClick = useCallback((id: number) => {
    console.log('❤️ [Category] 좋아요 버튼 클릭:', id);
    // TODO: 좋아요 토글 로직 구현
  }, []);

  /**
   * 바텀시트 필터 적용 핸들러
   * 필터가 적용되면 searchParams가 변경되어 자동으로 데이터 리패치됨
   */
  const handleFilterApply = useCallback(() => {
    console.log('🔄 [Category] 필터 적용');
    // 필터가 적용되면 자동으로 데이터 리패치됨 (searchParams 변경으로)
  }, []);

  /**
   * 카테고리 바텀시트에서 1차 카테고리 선택 핸들러
   */
  const handleCategorySelect = useCallback((categoryValue: CategoryValue) => {
    if (categoryValue === 'all') {
      setSelectedMainCategoryId(null);
      setSelectedUiCategoryId(null);
      setSelectedSubCategoryId(null);
    } else {
      const category = categories.find((c) => c.value === categoryValue);
      if (category) {
        setSelectedMainCategoryId(category.categoryId || null);
        setSelectedUiCategoryId(category.categoryId || null);
        setSelectedSubCategoryId(null); // 1차 카테고리 변경 시 2차는 초기화
      }
    }
  }, [categories]);

  /**
   * 카테고리 바텀시트에서 2차 카테고리 선택 핸들러
   */
  const handleSubCategorySelect = useCallback((subCategoryId: number | null) => {
    setSelectedSubCategoryId(subCategoryId);
  }, []);

  // ========== 모바일 버튼 표시 텍스트 계산 ==========

  /**
   * 지역 버튼에 표시할 텍스트 계산
   * 선택된 지역이 있으면 해당 지역명, 없으면 "지역"
   */
  const getRegionDisplayText = () => {
    if (selectedRegions.length === 0) return '지역';
    // REGIONS는 문자열 배열이므로 직접 반환
    return selectedRegions[0] || '지역';
  };

  /**
   * 상영관 종류 버튼에 표시할 텍스트 계산
   * 선택된 상영관 종류가 있으면 해당 종류명, 없으면 "상영관 종류"
   */
  const getTheaterTypeDisplayText = () => {
    if (selectedTheaterType.length === 0) return '상영관 종류';
    return selectedTheaterType[0];
  };

  // ========== 렌더링 ==========
  return (
    <>
      {/* 메인 레이아웃: ListShell 컴포넌트 사용 (header + sidebar + content 구조) */}
      <ListShell
        header={
          <>
            {/* ========== 데스크톱 헤더 ========== */}
            {/* 1차/2차 카테고리 모두 선택 가능한 CategorySelectSection 사용 */}
            <div className="hidden lg:block">
              <CategorySelectSection
                categories={categories}
                selectedCategory={selectedUiCategoryId === null ? 'all' : categories.find((c) => c.categoryId === selectedUiCategoryId)?.value || 'all'}
                onCategoryChange={(categoryValue) => {
                  if (categoryValue === 'all') {
                    setSelectedMainCategoryId(null);
                    setSelectedUiCategoryId(null);
                    setSelectedSubCategoryId(null);
                  } else {
                    const category = categories.find((c) => c.value === categoryValue);
                    if (category) {
                      setSelectedMainCategoryId(category.categoryId || null);
                      setSelectedUiCategoryId(category.categoryId || null);
                      setSelectedSubCategoryId(category.categoryId || null);
                    }
                  }
                }}
                selectedSubCategory={selectedSubCategoryId}
                onSubCategoryChange={setSelectedSubCategoryId}
                variant="brand1"
              />
            </div>

          </>
        }
        // {/* ========== 데스크톱 사이드바 ========== */
        // {/* 모바일에서는 숨김, 데스크톱에서만 표시되는 고정 필터 패널들 */}
        sidebar={
          <div className="max-lg:hidden space-y-10">
            {/* 지역 필터 패널 */}
            <RegionFilterPanel regions={regions} value={selectedRegions} onChange={setSelectedRegions} onReset={() => setSelectedRegions([])} />

            {/* 상영관 종류 필터 패널 */}
            <TheaterTypeFilterPanel types={theaterTypes} value={selectedTheaterType} onChange={setSelectedTheaterType} onReset={() => setSelectedTheaterType([])} />
          </div>
        }
        // {/* ========== 메인 컨텐츠 영역 ========== */}
        content={
          <div className="space-y-3">
            {/* ========== 모바일 전용 카테고리 헤더 ========== */}
            <div className="block lg:hidden space-y-3">{/* 모바일에서만 표시되는 카테고리 필터 */}

              {/* 1차 카테고리 선택 버튼들 */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-1">
                  {/* 전체 버튼 */}
                  <CategoryButton
                    selected={selectedUiCategoryId === null}
                    categoryValue="all"
                    page="category"
                    uniformWidth={false}
                    showNotches={false}
                    className="whitespace-nowrap"
                    onClick={() => {
                      setActiveBottomSheet('category');
                    }}
                  >
                    전체
                  </CategoryButton>

                  {/* 기존 카테고리 버튼들 */}
                  {categories.filter(cat => cat.value !== 'all').map((category) => (
                    <CategoryButton
                      key={category.value}
                      icon={category.icon}
                      selected={selectedUiCategoryId === category.categoryId}
                      categoryValue={category.value}
                      page="category"
                      uniformWidth={true}
                      onClick={() => {
                        setSelectedMainCategoryId(category.categoryId || null);
                        setSelectedUiCategoryId(category.categoryId || null);
                        setSelectedSubCategoryId(null);
                        setActiveBottomSheet('category');
                      }}
                    >
                      {category.label}
                    </CategoryButton>
                  ))}
                </div>
              </div>

              {/* 지역, 상영관 종류 필터 버튼들 */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setActiveBottomSheet('region')} className="flex-1 flex items-center justify-center gap-1">
                  <span>{getRegionDisplayText()}</span>
                  <ChevronDown size={14} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveBottomSheet('theater')} className="flex-1 flex items-center justify-center gap-1">
                  <span>{getTheaterTypeDisplayText()}</span>
                  <ChevronDown size={14} />
                </Button>
              </div>
            </div>

            {/* 정렬 옵션 바 (최신순, 인기순, 마감임박순 + 마감된 펀딩 포함 체크박스) */}
            <SortBar sortBy={sortBy} onSortChange={setSortBy} isClosed={showClosed} onIsClosedChange={setShowClosed} />

            {/* 펀딩 카드 목록 (무한스크롤 지원) */}
            <ResponsiveCardList
              items={items} // 표시할 펀딩 아이템 배열
              mode="funding" // 카드 모드 (funding/vote/search)
              loading={isLoading} // 초기 로딩 상태
              empty={!isLoading && items.length === 0} // 빈 목록 상태
              error={!!error} // 에러 상태
              onCardClick={handleCardClick} // 카드 클릭 시 상세 페이지 이동
              onVoteClick={handleVoteClick} // 좋아요 버튼 클릭 핸들러
              onResetFilters={handleResetFilters} // 필터 초기화 핸들러
              onRetry={handleRetry} // 에러 시 재시도 핸들러
              onLoadMore={handleLoadMore} // 무한스크롤 로드 더보기
              hasNextPage={hasNextPage} // 다음 페이지 존재 여부
              isFetchingNextPage={isFetchingNextPage} // 다음 페이지 로딩 중 여부
            />
          </div>
        }
      />

      {/* ========== 모바일 바텀시트들 ========== */}

      {/* 카테고리 선택 바텀시트 */}
      <FilterBottomSheet isOpen={activeBottomSheet === 'category'} onClose={() => setActiveBottomSheet(null)} title="카테고리 선택하기" onApplyFilter={handleFilterApply}>
        <CategoryBottomSheetContent
          selectedCategory={categories.find(cat => cat.categoryId === selectedUiCategoryId)?.value || 'all'}
          selectedSubCategory={selectedSubCategoryId}
          onCategoryChange={handleCategorySelect}
          onSubCategoryChange={handleSubCategorySelect}
          categories={categories}
        />
      </FilterBottomSheet>

      {/* 지역 선택 바텀시트 */}
      <FilterBottomSheet isOpen={activeBottomSheet === 'region'} onClose={() => setActiveBottomSheet(null)} title="지역 선택하기" onApplyFilter={handleFilterApply}>
        {/* 데스크톱과 동일한 RegionFilterPanel 컴포넌트 재사용 */}
        <RegionFilterPanel regions={regions} value={selectedRegions} onChange={setSelectedRegions} onReset={() => setSelectedRegions([])} />
      </FilterBottomSheet>

      {/* 상영관 종류 선택 바텀시트 */}
      <FilterBottomSheet isOpen={activeBottomSheet === 'theater'} onClose={() => setActiveBottomSheet(null)} title="상영관 종류 선택하기" onApplyFilter={handleFilterApply}>
        {/* 데스크톱과 동일한 TheaterTypeFilterPanel 컴포넌트 재사용 */}
        <TheaterTypeFilterPanel types={theaterTypes} value={selectedTheaterType} onChange={setSelectedTheaterType} onReset={() => setSelectedTheaterType([])} />
      </FilterBottomSheet>
    </>
  );
}
