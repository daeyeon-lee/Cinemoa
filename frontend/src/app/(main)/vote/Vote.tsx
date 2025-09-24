'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';

import { useRouter } from 'next/navigation';
// ui
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { SortBar } from '@/components/filters/SortBar';
import { ResponsiveCardList } from '@/components/lists/ResponsiveCardList';
// 웹
import { ListShell } from '@/components/layouts/ListShell';
import { CategorySelectSection } from '@/components/filters/CategorySelectSection';
import { CategoryButtonGroup } from '@/components/filters/CategoryButtonGroup';
import { RegionFilterPanel } from '@/components/filters/RegionFilterPanel';
import { TheaterTypeFilterPanel } from '@/components/filters/TheaterTypeFilterPanel';
// 모바일
import { FilterBottomSheet } from '@/components/filters/sheets/FilterBottomSheet';
import { CategoryBottomSheetContent } from '@/components/filters/sheets/CategoryBottomSheetContent';
import { RegionBottomSheetContent } from '@/components/filters/sheets/RegionBottomSheetContent';
import { TheaterTypeBottomSheetContent } from '@/components/filters/sheets/TheaterTypeBottomSheetContent';
//type, 상수
import type { CardItem } from '@/components/lists/ResponsiveCardList';

import { REGIONS, THEATER_TYPES } from '@/constants/regions';
import { STANDARD_CATEGORIES, type CategoryValue } from '@/constants/categories';
//api 관련
import { useAuthStore } from '@/stores/authStore';
import { useSearch } from '@/hooks/queries/useSearch';
import type { SearchParams, SortBy } from '@/types/searchApi';

/**
 * 이거어때 페이지 컴포넌트
 *
 * @description 투표 프로젝트를 둘러볼 수 있는 페이지입니다.
 * ListShell을 기반으로 필터링과 정렬 기능을 제공하며, brand2 컬러를 사용합니다.
 */
export default function Vote() {
  console.log('🎯 [Vote] 컴포넌트 렌더링');
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

  // ========== 모바일 바텀시트 임시 상태들 ==========
  // 바텀시트에서 선택 중인 임시 값들 (적용하기 버튼 누르기 전까지는 실제 상태에 반영 안됨)
  const [tempSelectedMainCategoryId, setTempSelectedMainCategoryId] = useState<number | null>(null);
  const [tempSelectedSubCategoryId, setTempSelectedSubCategoryId] = useState<number | null>(null);
  const [tempSelectedRegions, setTempSelectedRegions] = useState<string[]>([]);
  const [tempSelectedTheaterType, setTempSelectedTheaterType] = useState<string[]>([]);

  // ========== 반응형 화면 크기 감지 및 바텀시트 자동 닫기 ==========
  // 모바일에서 웹으로 화면 크기가 변경될 때 바텀시트를 자동으로 닫기
  useEffect(() => {
    const handleResize = () => {
      // lg 브레이크포인트 (1024px) 이상에서는 바텀시트 닫기
      if (window.innerWidth >= 1024 && activeBottomSheet) {
        // 임시 상태를 원래 상태로 되돌림
        setTempSelectedMainCategoryId(selectedMainCategoryId);
        setTempSelectedSubCategoryId(selectedSubCategoryId);
        setTempSelectedRegions(selectedRegions);
        setTempSelectedTheaterType(selectedTheaterType);
        setActiveBottomSheet(null);
      }
    };

    // 초기 실행
    handleResize();

    // resize 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeBottomSheet, selectedMainCategoryId, selectedSubCategoryId, selectedRegions, selectedTheaterType]);

  // ========== 상수 데이터 정의 ==========
  const categories = STANDARD_CATEGORIES; // 전체, 영화, 시리즈, 공연, 스포츠중계 등의 카테고리 목록
  const regions = REGIONS; // 서울, 부산, 대구 등의 지역 목록
  const theaterTypes = THEATER_TYPES; // 일반, IMAX, 4DX 등의 상영관 종류 목록

  // 🔍 useSearch 훅으로 API 데이터 조회 - 투표용 (사용자가 선택한 것만 전달)
  const searchParams = useMemo(() => {
    const params: SearchParams = {
      fundingType: 'VOTE' as const, // 이거어때는 투표만
      userId: user?.userId ? Number(user.userId) : undefined, // 사용자 ID 추가
    };

    // 사용자가 정렬을 변경했을 때만 전달 (기본값: LATEST)
    if (sortBy !== 'LATEST') {
      params.sortBy = sortBy;
    }

    // 카테고리 선택 로직 (단일 값만 전달)
    if (selectedMainCategoryId === null) {
      // 전체 선택: category 파라미터 없음 (모든 카테고리)
      // params.category는 추가하지 않음
    } else if (selectedSubCategoryId !== null) {
      // 세부 카테고리 선택: 선택된 세부 카테고리 전달
      params.category = selectedSubCategoryId;
    } else if (selectedMainCategoryId) {
      // 1차 카테고리 선택했지만 서브카테고리 선택 안함 (예: "영화-전체")
      params.category = selectedMainCategoryId;
    }

    // 사용자가 지역을 선택했을 때만 전달 (기본값: 전체)
    if (selectedRegions.length > 0) {
      params.region = selectedRegions[0];
    }

    // 사용자가 상영관 타입을 선택했을 때만 전달 (기본값: 전체)
    // selectedTheaterType에는 한글 label이 들어있으므로 백엔드용 value로 변환
    if (selectedTheaterType.length > 0) {
      const theaterValues = selectedTheaterType.map((label) => theaterTypes.find((type) => type.label === label)?.value).filter(Boolean);
      if (theaterValues.length > 0) {
        params.theaterType = theaterValues as string[];
      }
    }

    // 사용자가 종료된 상영회 포함을 체크했을 때만 전달 (기본값: false)
    if (showClosed) {
      params.isClosed = showClosed;
    }

    console.log('📤 [Vote] API 파라미터 (선택된 것만):', params);
    return params;
  }, [sortBy, selectedMainCategoryId, selectedSubCategoryId, selectedRegions, selectedTheaterType, showClosed, categories, theaterTypes, user?.userId]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useSearch(searchParams);

  const items = data?.content || [];

  console.log('📊 [Vote] 현재 데이터 상태:', {
    itemsCount: items.length,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: !!error,
  });

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSelectedMainCategoryId(null);
    setSelectedUiCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedRegions([]);
    setSelectedTheaterType([]);
    setSortBy('LATEST');
    setShowClosed(false);
  };

  // ========== 모바일 바텀시트 핸들러들 ==========

  const handleOpenCategoryBottomSheet = useCallback(() => {
    // 현재 실제 상태를 임시 상태에 복사
    setTempSelectedMainCategoryId(selectedMainCategoryId);
    setTempSelectedSubCategoryId(selectedSubCategoryId);
    setActiveBottomSheet('category');
  }, [selectedMainCategoryId, selectedSubCategoryId]);

  const handleOpenRegionBottomSheet = useCallback(() => {
    // 현재 실제 상태를 임시 상태에 복사
    setTempSelectedRegions([...selectedRegions]);
    setActiveBottomSheet('region');
  }, [selectedRegions]);

  const handleOpenTheaterBottomSheet = useCallback(() => {
    // 현재 실제 상태를 임시 상태에 복사
    setTempSelectedTheaterType([...selectedTheaterType]);
    setActiveBottomSheet('theater');
  }, [selectedTheaterType]);

  // 임시 카테고리 선택 핸들러 (바텀시트 내부용)
  const handleTempCategorySelect = useCallback(
    (categoryValue: CategoryValue) => {
      const selectedCategory = categories.find((cat) => cat.value === categoryValue);
      setTempSelectedMainCategoryId(selectedCategory?.categoryId || null);
      if (categoryValue === 'all') {
        setTempSelectedSubCategoryId(null);
      } else {
        setTempSelectedSubCategoryId(selectedCategory?.categoryId || null);
      }
    },
    [categories],
  );

  // 임시 서브카테고리 선택 핸들러 (바텀시트 내부용)
  const handleTempSubCategorySelect = useCallback((subCategoryId: number | null) => {
    setTempSelectedSubCategoryId(subCategoryId);
  }, []);

  // 필터 적용 핸들러 (바텀시트에서 적용 버튼 클릭 시)
  const handleFilterApply = useCallback(() => {
    if (activeBottomSheet === 'category') {
      setSelectedMainCategoryId(tempSelectedMainCategoryId);
      setSelectedUiCategoryId(tempSelectedMainCategoryId);
      setSelectedSubCategoryId(tempSelectedSubCategoryId);
    } else if (activeBottomSheet === 'region') {
      setSelectedRegions([...tempSelectedRegions]);
    } else if (activeBottomSheet === 'theater') {
      setSelectedTheaterType([...tempSelectedTheaterType]);
    }
    setActiveBottomSheet(null);
  }, [activeBottomSheet, tempSelectedMainCategoryId, tempSelectedSubCategoryId, tempSelectedRegions, tempSelectedTheaterType]);

  // 표시용 텍스트 생성 함수들
  const getRegionDisplayText = () => {
    if (selectedRegions.length === 0) return '지역';
    if (selectedRegions.length === 1) return selectedRegions[0];
    return `${selectedRegions[0]} 외 ${selectedRegions.length - 1}곳`;
  };

  const getTheaterTypeDisplayText = () => {
    if (selectedTheaterType.length === 0) return '상영관 종류';
    if (selectedTheaterType.length === 1) return selectedTheaterType[0];
    return `${selectedTheaterType[0]} 외 ${selectedTheaterType.length - 1}개`;
  };

  /**
   * 카테고리 버튼에 표시할 텍스트 계산
   * 선택된 카테고리가 있으면 "카테고리명-세부카테고리명" 형태, 없으면 "카테고리"
   */
  const getCategoryDisplayText = () => {
    if (selectedMainCategoryId === null) return '카테고리';

    const mainCategory = categories.find(cat => cat.categoryId === selectedMainCategoryId);
    if (!mainCategory) return '카테고리';

    // 1차 카테고리만 선택된 경우
    if (selectedSubCategoryId === null || selectedSubCategoryId === selectedMainCategoryId) {
      return mainCategory.label;
    }

    // 2차 카테고리가 선택된 경우
    const subCategory = mainCategory.items?.find(sub => sub.categoryId === selectedSubCategoryId);
    if (subCategory) {
      return `${mainCategory.label}-${subCategory.categoryName}`;
    }

    return mainCategory.label;
  };

  // 🔄 재시도 핸들러
  const handleRetry = useCallback(() => {
    console.log('🔄 [Vote] 재시도 버튼 클릭');
    refetch();
  }, [refetch]);

  // 🔄 무한 스크롤 핸들러
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📋 [Vote] 다음 페이지 로드');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 🖱️ 카드 클릭 핸들러
  const handleCardClick = useCallback(
    (id: number) => {
      console.log('🎯 [Vote] 투표 카드 클릭:', id);
      router.push(`/detail/${id}`);
    },
    [router],
  );

  // ❤️ 투표 클릭 핸들러
  const handleVoteClick = useCallback((id: number) => {
    console.log('❤️ [Vote] 투표 버튼 클릭:', id);
    // TODO: 투표 토글 로직 구현
  }, []);

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      console.log('[Vote] 스크롤 감지 - 다음 페이지 로드');
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <ListShell
      header={
        <CategorySelectSection
          categories={categories}
          selectedCategory={categories.find((cat) => cat.categoryId === selectedUiCategoryId)?.value || 'all'}
          onCategoryChange={(categoryValue) => {
            const selectedCategory = categories.find((cat) => cat.value === categoryValue);
            setSelectedMainCategoryId(selectedCategory?.categoryId || null);
            setSelectedUiCategoryId(selectedCategory?.categoryId || null);
            if (categoryValue === 'all') {
              setSelectedSubCategoryId(null);
            } else {
              setSelectedSubCategoryId(selectedCategory?.categoryId || null);
            }
          }}
          selectedSubCategory={selectedSubCategoryId}
          onSubCategoryChange={setSelectedSubCategoryId}
          variant="brand2"
        />
      }
      sidebar={
        <div className="space-y-10 hidden lg:block">
          {/* 지역 필터 */}
          <RegionFilterPanel regions={regions} value={selectedRegions} onChange={setSelectedRegions} onReset={() => setSelectedRegions([])} variant="brand2" />

          {/* 상영관 타입 필터 */}
          <TheaterTypeFilterPanel types={theaterTypes} value={selectedTheaterType} onChange={setSelectedTheaterType} onReset={() => setSelectedTheaterType([])} variant="brand2" />
        </div>
      }
      content={
        <>
          <div className="space-y-3">
            {/* ========== 모바일 전용 필터 헤더 ========== */}
            <div className="block lg:hidden">
              {/* 세 개의 필터 버튼: 카테고리, 지역, 상영관 종류 */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenCategoryBottomSheet}
                  className={`${
                    getCategoryDisplayText() === '카테고리'
                      ? 'flex-1'
                      : 'flex-shrink-0'
                  } relative flex items-center justify-center pl-3 pr-8 whitespace-nowrap`}
                >
                  <span className="truncate">{getCategoryDisplayText()}</span>
                  <ChevronDown size={14} className="absolute right-2 flex-shrink-0" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenRegionBottomSheet}
                  className={`${
                    getRegionDisplayText() === '지역'
                      ? 'flex-1'
                      : 'flex-shrink-0'
                  } relative flex items-center justify-center pl-3 pr-8 whitespace-nowrap`}
                >
                  <span className="truncate">{getRegionDisplayText()}</span>
                  <ChevronDown size={14} className="absolute right-2 flex-shrink-0" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenTheaterBottomSheet}
                  className={`${
                    getTheaterTypeDisplayText() === '상영관 종류'
                      ? 'flex-1'
                      : 'flex-shrink-0'
                  } relative flex items-center justify-center pl-3 pr-8 whitespace-nowrap`}
                >
                  <span className="truncate">{getTheaterTypeDisplayText()}</span>
                  <ChevronDown size={14} className="absolute right-2 flex-shrink-0" />
                </Button>
              </div>
            </div>

            {/* 정렬 바 */}
            <SortBar sortBy={sortBy} onSortChange={setSortBy} isClosed={showClosed} onIsClosedChange={setShowClosed} />

            {/* 카드 목록 */}
            <ResponsiveCardList
              items={items}
              mode="vote"
              loading={isLoading}
              empty={!isLoading && items.length === 0}
              error={!!error}
              onCardClick={handleCardClick}
              onVoteClick={handleVoteClick}
              onResetFilters={handleResetFilters}
              onRetry={handleRetry}
              onLoadMore={handleLoadMore}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>

          {/* ========== 모바일 바텀시트들 ========== */}

          {/* 카테고리 선택 바텀시트 */}
          <FilterBottomSheet
            isOpen={activeBottomSheet === 'category'}
            onClose={() => {
              // 취소 시 임시 상태를 원래 상태로 되돌림
              setTempSelectedMainCategoryId(selectedMainCategoryId);
              setTempSelectedSubCategoryId(selectedSubCategoryId);
              setActiveBottomSheet(null);
            }}
            title="카테고리 선택하기"
            onApplyFilter={handleFilterApply}
            variant="brand2"
          >
            <CategoryBottomSheetContent
              selectedCategory={categories.find((cat) => cat.categoryId === tempSelectedMainCategoryId)?.value || 'all'}
              selectedSubCategory={tempSelectedSubCategoryId}
              onCategoryChange={handleTempCategorySelect}
              onSubCategoryChange={handleTempSubCategorySelect}
              categories={categories}
              variant="brand2"
            />
          </FilterBottomSheet>

          {/* 지역 선택 바텀시트 */}
          <FilterBottomSheet
            isOpen={activeBottomSheet === 'region'}
            onClose={() => {
              // 취소 시 임시 상태를 원래 상태로 되돌림
              setTempSelectedRegions(selectedRegions);
              setActiveBottomSheet(null);
            }}
            title="지역 선택하기"
            onApplyFilter={handleFilterApply}
            onReset={() => setTempSelectedRegions([])}
            resetDisabled={tempSelectedRegions.length === 0}
            variant="brand2"
          >
            <RegionBottomSheetContent regions={regions} value={tempSelectedRegions} onChange={setTempSelectedRegions} variant="brand2" />
          </FilterBottomSheet>

          {/* 상영관 종류 선택 바텀시트 */}
          <FilterBottomSheet
            isOpen={activeBottomSheet === 'theater'}
            onClose={() => {
              // 취소 시 임시 상태를 원래 상태로 되돌림
              setTempSelectedTheaterType(selectedTheaterType);
              setActiveBottomSheet(null);
            }}
            title="상영관 종류 선택하기"
            onApplyFilter={handleFilterApply}
            onReset={() => setTempSelectedTheaterType([])}
            resetDisabled={tempSelectedTheaterType.length === 0}
            variant="brand2"
          >
            <TheaterTypeBottomSheetContent types={theaterTypes} value={tempSelectedTheaterType} onChange={setTempSelectedTheaterType} variant="brand2" />
          </FilterBottomSheet>
        </>
      }
    />
  );
}
