'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
// ui
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { SortBar } from '@/components/filters/SortBar';
import { ResponsiveCardList } from '@/components/lists/ResponsiveCardList';
// 웹
import { ListShell } from '@/components/layout/ListShell';
import { CategorySelectSection } from '@/components/filters/CategorySelectSection';
import { RegionFilterPanel } from '@/components/filters/RegionFilterPanel';
import { TheaterTypeFilterPanel } from '@/components/filters/TheaterTypeFilterPanel';
// 모바일
import { FilterBottomSheet } from '@/components/filters/sheets/FilterBottomSheet';
import { CategoryBottomSheetContent } from '@/components/filters/sheets/CategoryBottomSheetContent';
import { RegionBottomSheetContent } from '@/components/filters/sheets/RegionBottomSheetContent';
import { TheaterTypeBottomSheetContent } from '@/components/filters/sheets/TheaterTypeBottomSheetContent';
//type, 상수
import { STANDARD_CATEGORIES, type CategoryValue } from '@/constants/categories';
import { REGIONS, THEATER_TYPES } from '@/constants/regions';
//api 관련
import { useAuthStore } from '@/stores/authStore';
import { useSearch } from '@/hooks/queries/useSearch';
import { useFundingLike } from '@/hooks/queries/useFunding'; // ✅ 동일 훅 import
import type { SearchParams, SortBy } from '@/types/searchApi';
//icon
import SearchIcon from '@/components/icon/searchIcon';
/**
 * 검색 페이지 컴포넌트
 *
 * @description 검색을 통해 펀딩 프로젝트를 찾을 수 있는 페이지입니다.
 * ListShell을 기반으로 필터링과 정렬 기능을 제공합니다.
 */
export default function Search() {
  // console.log('🔍 [Search] 컴포넌트 렌더링');

  const urlSearchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient(); // ✅ React Query 클라이언트 접근

  // ========== 필터 상태 관리 ==========
  // 카테고리 관련 상태들 (1차: 단일 선택, 2차: 다중 선택)
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(null); // 선택된 1차 카테고리 ID (1=영화, 2=시리즈, 3=공연, 4=스포츠중계)
  const [selectedUiCategoryId, setSelectedUiCategoryId] = useState<number | null>(null); // UI 표시용 카테고리 ID (null=전체 카테고리, 1=영화 전체, 2=시리즈 전체, etc.)
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<number[]>([]); // 선택된 2차 카테고리 ID들 (다중 선택)

  // 지역 및 상영관 필터 상태들
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]); // 선택된 지역 배열 (현재는 단일 선택)
  const [selectedTheaterType, setSelectedTheaterType] = useState<string[]>([]); // 선택된 상영관 종류 배열

  // 정렬 및 옵션 상태들
  const [sortBy, setSortBy] = useState<SortBy>('LATEST'); // 정렬 기준 (LATEST, POPULAR, DEADLINE, etc.)
  const [showClosed, setShowClosed] = useState<boolean>(false); // 마감된 펀딩 포함 여부

  // 검색어 상태 (URL에서 초기값 설정)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputQuery, setInputQuery] = useState<string>(''); // 검색창 입력용

  // ========== 모바일 바텀시트 상태 관리 ==========
  // 현재 활성화된 바텀시트 종류를 추적 (null이면 모든 바텀시트 닫힘)
  const [activeBottomSheet, setActiveBottomSheet] = useState<'category' | 'region' | 'theater' | null>(null);

  // ========== 모바일 바텀시트 임시 상태들 ==========
  // 바텀시트에서 선택 중인 임시 값들 (적용하기 버튼 누르기 전까지는 실제 상태에 반영 안됨)
  const [tempSelectedMainCategoryId, setTempSelectedMainCategoryId] = useState<number | null>(null);
  const [tempSelectedSubCategoryIds, setTempSelectedSubCategoryIds] = useState<number[]>([]);
  const [tempSelectedRegions, setTempSelectedRegions] = useState<string[]>([]);
  const [tempSelectedTheaterType, setTempSelectedTheaterType] = useState<string[]>([]);

  // URL 쿼리 파라미터에서 검색어 초기화
  useEffect(() => {
    const urlQuery = urlSearchParams.get('q') || '';
    setSearchQuery(urlQuery);
    setInputQuery(urlQuery);
  }, [urlSearchParams]);

  // ========== 반응형 화면 크기 감지 및 바텀시트 자동 닫기 ==========
  // 모바일에서 웹으로 화면 크기가 변경될 때 바텀시트를 자동으로 닫기
  useEffect(() => {
    const handleResize = () => {
      // lg 브레이크포인트 (1024px) 이상에서는 바텀시트 닫기
      if (window.innerWidth >= 1024 && activeBottomSheet) {
        // 임시 상태를 원래 상태로 되돌림
        setTempSelectedMainCategoryId(selectedMainCategoryId);
        setTempSelectedSubCategoryIds(selectedSubCategoryIds);
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
  }, [activeBottomSheet, selectedMainCategoryId, selectedSubCategoryIds, selectedRegions, selectedTheaterType]);

  // ========== 상수 데이터 정의 ==========
  const categories = STANDARD_CATEGORIES; // 전체, 영화, 시리즈, 공연, 스포츠중계 등의 카테고리 목록
  const regions = REGIONS; // 서울, 부산, 대구 등의 지역 목록
  const theaterTypes = THEATER_TYPES; // 일반, IMAX, 4DX 등의 상영관 종류 목록

  // 🔍 useSearch 훅으로 API 데이터 조회 - 검색용 (사용자가 선택한 것만 전달)
  const searchParams = useMemo(() => {
    const params: SearchParams = {
      userId: user?.userId ? Number(user.userId) : undefined, // 사용자 ID 추가
    };

    // 검색어가 있으면 q 파라미터 추가
    if (searchQuery.trim()) {
      params.q = searchQuery.trim();
    }

    // 사용자가 정렬을 변경했을 때만 전달 (기본값: LATEST)
    if (sortBy !== 'LATEST') {
      params.sortBy = sortBy;
    }

    // 카테고리 선택 로직 (단일 값만 전달)
    if (selectedUiCategoryId === null) {
      // "전체" 선택: category 파라미터를 전달하지 않음 → 모든 카테고리 조회
    } else if (selectedSubCategoryIds.length > 0) {
      // 2차 카테고리들이 선택된 경우: 선택된 세부 카테고리들만 조회
      params.category = selectedSubCategoryIds;
    } else if (selectedMainCategoryId !== null) {
      // 1차 카테고리만 선택된 경우: 해당 1차 카테고리의 모든 서브카테고리 조회
      params.category = [selectedMainCategoryId];
    }

    // 사용자가 지역을 선택했을 때만 전달 (기본값: 전체)
    if (selectedRegions.length > 0) {
      params.region = selectedRegions;
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

    // console.log('📤 [Search] API 파라미터 (선택된 것만):', params);
    return params;
  }, [searchQuery, sortBy, selectedUiCategoryId, selectedMainCategoryId, selectedSubCategoryIds, selectedRegions, selectedTheaterType, showClosed, user?.userId]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useSearch(searchParams);
  const { mutate: toggleLike } = useFundingLike(); // ✅ 좋아요 토글 훅

  const items = data?.content || [];

  // console.log('📊 [Search] 현재 데이터 상태:', {
  //   itemsCount: items.length,
  //   hasNextPage,
  //   isFetchingNextPage,
  //   isLoading,
  //   error: !!error,
  //   searchQuery,
  // });

  // 검색 실행 핸들러
  const handleSearch = useCallback(() => {
    // URL 변경 없이 내부 상태만 업데이트
    setSearchQuery(inputQuery.trim());
  }, [inputQuery]);

  // 엔터키 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSelectedMainCategoryId(null);
    setSelectedUiCategoryId(null);
    setSelectedSubCategoryIds([]);
    setSelectedRegions([]);
    setSelectedTheaterType([]);
    setSortBy('LATEST');
    setShowClosed(false);
    // 검색어는 초기화하지 않음 (URL 기준 유지)
  };

  // ========== 모바일 바텀시트 핸들러들 ==========

  const handleOpenCategoryBottomSheet = useCallback(() => {
    // 현재 실제 상태를 임시 상태에 복사
    setTempSelectedMainCategoryId(selectedMainCategoryId);
    setTempSelectedSubCategoryIds(selectedSubCategoryIds);
    setActiveBottomSheet('category');
  }, [selectedMainCategoryId, selectedSubCategoryIds]);

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
        setTempSelectedSubCategoryIds([]);
      } else {
        setTempSelectedSubCategoryIds([]);
      }
    },
    [categories],
  );

  // 임시 서브카테고리 선택 핸들러 (바텀시트 내부용)
  const handleTempSubCategorySelect = useCallback((subCategoryIds: number[]) => {
    setTempSelectedSubCategoryIds(subCategoryIds);
  }, []);

  // 필터 적용 핸들러 (바텀시트에서 적용 버튼 클릭 시)
  const handleFilterApply = useCallback(() => {
    if (activeBottomSheet === 'category') {
      setSelectedMainCategoryId(tempSelectedMainCategoryId);
      setSelectedUiCategoryId(tempSelectedMainCategoryId);
      setSelectedSubCategoryIds(tempSelectedSubCategoryIds);
    } else if (activeBottomSheet === 'region') {
      setSelectedRegions([...tempSelectedRegions]);
    } else if (activeBottomSheet === 'theater') {
      setSelectedTheaterType([...tempSelectedTheaterType]);
    }
    setActiveBottomSheet(null);
  }, [activeBottomSheet, tempSelectedMainCategoryId, tempSelectedSubCategoryIds, tempSelectedRegions, tempSelectedTheaterType]);

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

    const mainCategory = categories.find((cat) => cat.categoryId === selectedMainCategoryId);
    if (!mainCategory) return '카테고리';

    // 1차 카테고리만 선택된 경우 (2차 카테고리가 빈 배열이거나 선택되지 않은 경우)
    if (selectedSubCategoryIds.length === 0) {
      return mainCategory.label;
    }

    // 2차 카테고리가 선택된 경우
    if (selectedSubCategoryIds.length === 1) {
      const subCategory = mainCategory.items?.find((sub) => sub.categoryId === selectedSubCategoryIds[0]);
      if (subCategory) {
        return `${mainCategory.label}-${subCategory.categoryName}`;
      }
    } else if (selectedSubCategoryIds.length > 1) {
      // 2차 카테고리 다중 선택된 경우
      const firstSubCategory = mainCategory.items?.find((sub) => sub.categoryId === selectedSubCategoryIds[0]);
      if (firstSubCategory) {
        return `${mainCategory.label}-${firstSubCategory.categoryName} 외 ${selectedSubCategoryIds.length - 1}개`;
      }
    }

    return mainCategory.label;
  };

  // 🔄 재시도 핸들러
  const handleRetry = useCallback(() => {
    // console.log('🔄 [Search] 재시도 버튼 클릭');
    refetch();
  }, [refetch]);

  // 🔄 무한 스크롤 핸들러
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      // console.log('📋 [Search] 다음 페이지 로드');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 🖱️ 카드 클릭 핸들러
  const handleCardClick = useCallback(
    (id: number) => {
      // console.log('🔍 [Search] 카드 클릭:', id);
      router.push(`/detail/${id}`);
    },
    [router],
  );

  // ❤️ 좋아요 클릭 핸들러
  const handleVoteClick = useCallback(
    (fundingId: number) => {
      if (!user?.userId) {
        // 비로그인 처리 (로그인 유도 등)
        // console.log('🔐 로그인 필요');
        return;
      }

      // 1) 현재 목록 캐시들에서 해당 카드의 isLiked를 찾아냄
      const queries = queryClient.getQueriesData({ queryKey: ['search'] });
      let currentIsLiked: boolean | null = null;

      for (const [, data] of queries) {
        if (!data) continue;

        // 무한 스크롤 or 단일 페이지 대응
        const pages = Array.isArray((data as any)?.pages) ? (data as any).pages : [data];

        for (const page of pages) {
          const content = page?.data?.content ?? page?.content;
          if (!Array.isArray(content)) continue;

          for (const item of content) {
            const id = Number(item?.funding?.fundingId ?? item?.fundingId);
            if (id === fundingId) {
              // ✅ 카드에서 표시하는 필드를 그대로 사용하세요
              // (프로젝트에 따라 item.funding.stat.isLiked 인 곳도 있음)
              currentIsLiked = (item?.funding?.isLiked ?? item?.funding?.stat?.isLiked) === true;
              break;
            }
          }
          if (currentIsLiked !== null) break;
        }
        if (currentIsLiked !== null) break;
      }

      // 2) 못 찾았으면 보수적으로 false로 간주 (또는 상세 캐시 확인)
      const safeIsLiked = currentIsLiked ?? false;

      // console.log('❤️ [Search] 좋아요 토글:', { fundingId, currentIsLiked: safeIsLiked });

      // 3) 토글 실행 (공통 훅: 목록/상세 모두 같은 낙관적 업데이트 로직 공유)
      toggleLike({
        fundingId,
        userId: String(user.userId),
        isLiked: safeIsLiked,
      });
    },
    [user?.userId, queryClient, toggleLike],
  );

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      // console.log('[Search] 스크롤 감지 - 다음 페이지 로드');
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // ✅ bfcache 복원 시 목록/홈 강제 갱신
  useEffect(() => {
    // pageshow: 뒤로가기 복원(bfcache)까지 포착하는 이벤트
    const handlePageShow = (e: PageTransitionEvent) => {
      // e.persisted === true 이면 bfcache에서 복원된 것
      if (e.persisted) {
        // console.log('🔄 [Search] bfcache 복원 감지 - 쿼리 무효화');
        // 🔄 검색/홈 쿼리 무효화 → refetch 트리거
        queryClient.invalidateQueries({ queryKey: ['search'] }); // 'search' 키 전체
        queryClient.invalidateQueries({ queryKey: ['home'] }); // 홈 섹션도 쓰면 같이
      }
    };

    // 탭 비활성 → 활성 전환 시도도 안전망으로 갱신
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // console.log('👁️ [Search] 탭 활성화 감지 - 쿼리 무효화');
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
    <div>
      {/* 상단 검색창 */}
      <div className="w-full max-w-2xl mx-auto my-4 lg:my-7 px-4 flex items-center">
        <Input type="search" placeholder="검색어 입력하기" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} onKeyDown={handleKeyDown} className="flex-1" />
        <Button onClick={handleSearch} variant="ghost" className="hover:bg-BG-0">
          <SearchIcon width={24} height={24} stroke="#cbd5e1" className="md:w-9 md:h-9" />
        </Button>
      </div>

      <ListShell
        className="mt-0"
        header={
          <CategorySelectSection
            categories={categories}
            selectedCategory={categories.find((cat) => cat.categoryId === selectedUiCategoryId)?.value || 'all'}
            onCategoryChange={(categoryValue) => {
              const selectedCategory = categories.find((cat) => cat.value === categoryValue);
              setSelectedMainCategoryId(selectedCategory?.categoryId || null);
              setSelectedUiCategoryId(selectedCategory?.categoryId || null);
              if (categoryValue === 'all') {
                setSelectedSubCategoryIds([]);
              } else {
                setSelectedSubCategoryIds([]);
              }
            }}
            selectedSubCategory={selectedSubCategoryIds}
            onSubCategoryChange={setSelectedSubCategoryIds}
            variant="brand1"
          />
        }
        sidebar={
          <div className="space-y-10 hidden lg:block">
            {/* 지역 필터 */}
            <RegionFilterPanel regions={regions} value={selectedRegions} onChange={setSelectedRegions} onReset={() => setSelectedRegions([])} />

            {/* 상영관 타입 필터 */}
            <TheaterTypeFilterPanel types={theaterTypes} value={selectedTheaterType} onChange={setSelectedTheaterType} onReset={() => setSelectedTheaterType([])} />
          </div>
        }
        content={
          <>
            <div className="">
              {/* ========== 모바일 전용 필터 헤더 ========== */}
              <div className="block lg:hidden pb-3">
                {/* 세 개의 필터 버튼: 카테고리, 지역, 상영관 종류 */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleOpenCategoryBottomSheet}
                    className={`${getCategoryDisplayText() === '카테고리' ? 'flex-1' : 'flex-shrink-0'} relative flex items-center justify-center pl-3 pr-8 whitespace-nowrap`}
                  >
                    <span className="truncate">{getCategoryDisplayText()}</span>
                    <ChevronDown size={14} className="absolute right-2 flex-shrink-0" />
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleOpenRegionBottomSheet}
                    className={`${getRegionDisplayText() === '지역' ? 'flex-1' : 'flex-shrink-0'} relative flex items-center justify-center pl-3 pr-8 whitespace-nowrap`}
                  >
                    <span className="truncate">{getRegionDisplayText()}</span>
                    <ChevronDown size={14} className="absolute right-2 flex-shrink-0" />
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleOpenTheaterBottomSheet}
                    className={`${getTheaterTypeDisplayText() === '상영관 종류' ? 'flex-1' : 'flex-shrink-0'} relative flex items-center justify-center pl-3 pr-8 whitespace-nowrap`}
                  >
                    <span className="truncate">{getTheaterTypeDisplayText()}</span>
                    <ChevronDown size={14} className="absolute right-2 flex-shrink-0" />
                  </Button>
                </div>
              </div>

              {/* 정렬 바 */}
              <SortBar sortBy={sortBy} onSortChange={setSortBy} isClosed={false} onIsClosedChange={() => {}} />
              {/* <SortBar sortBy={sortBy} onSortChange={setSortBy} isClosed={showClosed} onIsClosedChange={setShowClosed} /> */}

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
                setTempSelectedSubCategoryIds(selectedSubCategoryIds);
                setActiveBottomSheet(null);
              }}
              title="카테고리 선택하기"
              onApplyFilter={handleFilterApply}
            >
              <CategoryBottomSheetContent
                selectedCategory={categories.find((cat) => cat.categoryId === tempSelectedMainCategoryId)?.value || 'all'}
                selectedSubCategory={tempSelectedSubCategoryIds}
                onCategoryChange={handleTempCategorySelect}
                onSubCategoryChange={handleTempSubCategorySelect}
                categories={categories}
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
            >
              <RegionBottomSheetContent regions={regions} value={tempSelectedRegions} onChange={setTempSelectedRegions} />
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
            >
              <TheaterTypeBottomSheetContent types={theaterTypes} value={tempSelectedTheaterType} onChange={setTempSelectedTheaterType} />
            </FilterBottomSheet>
          </>
        }
      />
    </div>
  );
}
