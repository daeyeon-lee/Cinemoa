'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
// ui
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
/**
 * 상영회 페이지 컴포넌트
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
  // console.log('🎯 [Category] 컴포넌트 렌더링');
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

  // ========== 모바일 바텀시트 상태 관리 ==========
  // 현재 활성화된 바텀시트 종류를 추적 (null이면 모든 바텀시트 닫힘)
  const [activeBottomSheet, setActiveBottomSheet] = useState<'category' | 'region' | 'theater' | null>(null);

  // ========== 모바일 바텀시트 임시 상태들 ==========
  // 바텀시트에서 선택 중인 임시 값들 (적용하기 버튼 누르기 전까지는 실제 상태에 반영 안됨)
  const [tempSelectedMainCategoryId, setTempSelectedMainCategoryId] = useState<number | null>(null);
  const [tempSelectedSubCategoryIds, setTempSelectedSubCategoryIds] = useState<number[]>([]);
  const [tempSelectedRegions, setTempSelectedRegions] = useState<string[]>([]);
  const [tempSelectedTheaterType, setTempSelectedTheaterType] = useState<string[]>([]);

  // ========== 초기화: localStorage에서 카테고리 정보 복원 ==========
  // 다른 페이지(홈, 검색 등)에서 카테고리를 선택하고 이 페이지로 왔을 때 해당 카테고리를 자동 선택
  useEffect(() => {
    const savedCategoryId = localStorage.getItem('selectedCategoryId');

    if (savedCategoryId) {
      const categoryId = parseInt(savedCategoryId, 10);
      // console.log('🎯 [Category] localStorage에서 categoryId 감지:', categoryId);

      // 1차 카테고리 선택 (ex: categoryId=1이면 영화 전체 선택)
      // ID 1=영화, 2=시리즈, 3=공연, 4=스포츠중계
      setSelectedMainCategoryId(categoryId);
      setSelectedUiCategoryId(categoryId);
      setSelectedSubCategoryIds([]); // 2차 카테고리는 빈 배열로 초기화

      // console.log('✅ [Category] 카테고리 초기화 완료:', {
      //   selectedMainCategoryId: categoryId,
      //   selectedUiCategoryId: categoryId,
      //   selectedSubCategoryIds: [],
      // });

      // 사용 후 localStorage 정리 (일회성 사용)
      localStorage.removeItem('selectedCategoryId');
    }
  }, []);

  // ========== 반응형 화면 크기 감지 및 바텀시트 자동 닫기 ==========
  // 모바일에서 웹으로 화면 크기가 변경될 때 바텀시트를 자동으로 닫기
  useEffect(() => {
    const handleResize = () => {
      // lg 브레이크포인트 (1024px) 이상에서는 바텀시트 닫기
      if (window.innerWidth >= 1024 && activeBottomSheet) {
        // 임시 상태를 원래 상태로 되돌림
        setTempSelectedMainCategoryId(selectedMainCategoryId);
        setTempSelectedSubCategoryIds([...selectedSubCategoryIds]);
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

  // ========== API 요청 파라미터 생성 ==========
  // 사용자가 선택한 필터 조건들을 API 요청용 파라미터로 변환
  // useMemo를 사용하여 불필요한 재계산 방지 및 성능 최적화
  const searchParams = useMemo(() => {
    const params: SearchParams = {
      fundingType: 'FUNDING' as const, // 상영회 페이지는 FUNDING 타입만 조회 (VOTE와 구분)
      userId: user?.userId ? Number(user.userId) : undefined, // 로그인한 사용자의 좋아요 정보 포함
    };

    // 정렬 조건: 기본값(LATEST)이 아닐 때만 API에 전달
    if (sortBy !== 'LATEST') {
      params.sortBy = sortBy;
    }

    // ========== 카테고리 필터링 로직 ==========
    if (selectedUiCategoryId === null) {
      // "전체" 선택: category 파라미터를 전달하지 않음 → 모든 카테고리 조회
    } else if (selectedSubCategoryIds.length > 0) {
      // 2차 카테고리들이 선택된 경우: 선택된 세부 카테고리들만 조회
      params.category = selectedSubCategoryIds;
    } else if (selectedMainCategoryId !== null) {
      // 1차 카테고리만 선택된 경우: 해당 1차 카테고리의 모든 서브카테고리 조회
      params.category = [selectedMainCategoryId];
    }

    // ========== 지역 필터링 ==========
    // 선택된 모든 지역들을 배열로 전달
    if (selectedRegions.length > 0) {
      params.region = selectedRegions;
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
  }, [sortBy, selectedUiCategoryId, selectedMainCategoryId, selectedSubCategoryIds, selectedRegions, selectedTheaterType, showClosed, categories, theaterTypes, user?.userId]);

  // ========== 데이터 조회 및 무한스크롤 ==========
  // useSearch 훅을 통한 API 데이터 조회 (React Query 기반 무한스크롤)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useSearch(searchParams);
  const { mutate: toggleLike } = useFundingLike(); // ✅ 좋아요 토글 훅

  // API에서 받아온 모든 페이지의 아이템들을 평탄화한 배열
  const items = data?.content || [];

  // 디버깅용 현재 상태 로깅
  // console.log('📊 [Category] 현재 데이터 상태:', {
  //   data,
  //   error: !!error,
  //   searchParams,
  //   dataPages: data?.pages?.length || 0,
  // });

  // ========== 이벤트 핸들러들 ==========

  /**
   * 필터 초기화 핸들러
   * 모든 필터 조건을 기본값으로 되돌림
   */
  const handleResetFilters = () => {
    setSelectedMainCategoryId(null);
    setSelectedUiCategoryId(null);
    setSelectedSubCategoryIds([]);
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
    // console.log('🔄 [Category] 재시도 버튼 클릭');
    refetch();
  }, [refetch]);

  /**
   * 무한스크롤 로드 더보기 핸들러
   * 사용자가 "더보기" 버튼을 클릭하거나 자동 트리거 시 다음 페이지 로드
   */
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      // console.log('📋 [Category] 다음 페이지 로드');
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
   */
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

      // console.log('❤️ [Category] 좋아요 토글:', { fundingId, currentIsLiked: safeIsLiked });

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
      // console.log('[Category] 스크롤 감지 - 다음 페이지 로드');
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
        // console.log('🔄 [Category] bfcache 복원 감지 - 쿼리 무효화');
        // 🔄 검색/홈 쿼리 무효화 → refetch 트리거
        queryClient.invalidateQueries({ queryKey: ['search'] }); // 'search' 키 전체
        queryClient.invalidateQueries({ queryKey: ['home'] }); // 홈 섹션도 쓰면 같이
      }
    };

    // 탭 비활성 → 활성 전환 시도도 안전망으로 갱신
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // console.log('👁️ [Category] 탭 활성화 감지 - 쿼리 무효화');
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

  /**
   * 바텀시트 열기 핸들러들
   */
  const handleOpenCategoryBottomSheet = useCallback(() => {
    // 현재 실제 상태를 임시 상태에 복사
    setTempSelectedMainCategoryId(selectedMainCategoryId);
    setTempSelectedSubCategoryIds([...selectedSubCategoryIds]);
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

  /**
   * 바텀시트 필터 적용 핸들러
   * 임시 상태의 값들을 실제 상태로 반영하여 필터링 적용
   */
  const handleFilterApply = useCallback(() => {
    // console.log('🔄 [Category] 필터 적용');

    // 현재 활성화된 바텀시트에 따라 해당 필터 적용
    if (activeBottomSheet === 'category') {
      setSelectedMainCategoryId(tempSelectedMainCategoryId);
      setSelectedUiCategoryId(tempSelectedMainCategoryId);
      setSelectedSubCategoryIds([...tempSelectedSubCategoryIds]);
    } else if (activeBottomSheet === 'region') {
      setSelectedRegions([...tempSelectedRegions]);
    } else if (activeBottomSheet === 'theater') {
      setSelectedTheaterType([...tempSelectedTheaterType]);
    }
  }, [activeBottomSheet, tempSelectedMainCategoryId, tempSelectedSubCategoryIds, tempSelectedRegions, tempSelectedTheaterType]);

  /**
   * 카테고리 바텀시트에서 1차 카테고리 선택 핸들러 (임시 상태 사용)
   */
  const handleTempCategorySelect = useCallback(
    (categoryValue: CategoryValue) => {
      if (categoryValue === 'all') {
        setTempSelectedMainCategoryId(null);
        setTempSelectedSubCategoryIds([]);
      } else {
        const category = categories.find((c) => c.value === categoryValue);
        if (category) {
          setTempSelectedMainCategoryId(category.categoryId || null);
          setTempSelectedSubCategoryIds([]); // 1차 카테고리 변경 시 2차는 초기화
        }
      }
    },
    [categories],
  );

  /**
   * 카테고리 바텀시트에서 2차 카테고리 선택 핸들러 (임시 상태 사용) - 다중 선택
   */
  const handleTempSubCategorySelect = useCallback((subCategoryIds: number[]) => {
    setTempSelectedSubCategoryIds(subCategoryIds);
  }, []);

  // ========== 모바일 버튼 표시 텍스트 계산 ==========

  /**
   * 지역 버튼에 표시할 텍스트 계산
   * 선택된 지역이 있으면 해당 지역명, 없으면 "지역"
   */
  const getRegionDisplayText = () => {
    if (selectedRegions.length === 0) return '지역';
    if (selectedRegions.length === 1) return selectedRegions[0];
    return `${selectedRegions[0]} 외 ${selectedRegions.length - 1}곳`;
  };

  /**
   * 상영관 종류 버튼에 표시할 텍스트 계산
   * 선택된 상영관 종류가 있으면 해당 종류명, 없으면 "상영관 종류"
   */
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

    // 2차 카테고리가 선택된 경우
    if (selectedSubCategoryIds.length > 0) {
      if (selectedSubCategoryIds.length === 1) {
        const subCategory = mainCategory.items?.find((sub) => sub.categoryId === selectedSubCategoryIds[0]);
        if (subCategory) {
          return `${mainCategory.label}-${subCategory.categoryName}`;
        }
      } else {
        const firstSubCategory = mainCategory.items?.find((sub) => sub.categoryId === selectedSubCategoryIds[0]);
        if (firstSubCategory) {
          return `${mainCategory.label}-${firstSubCategory.categoryName} 외 ${selectedSubCategoryIds.length - 1}개`;
        }
      }
    }

    // 1차 카테고리만 선택된 경우 (전체)
    return mainCategory.label;
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
                    setSelectedSubCategoryIds([]);
                  } else {
                    const category = categories.find((c) => c.value === categoryValue);
                    if (category) {
                      setSelectedMainCategoryId(category.categoryId || null);
                      setSelectedUiCategoryId(category.categoryId || null);
                      setSelectedSubCategoryIds([]); // 1차 선택 시 2차는 비우기
                    }
                  }
                }}
                selectedSubCategory={selectedSubCategoryIds}
                onSubCategoryChange={setSelectedSubCategoryIds}
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

            {/* 정렬 옵션 바 (최신순, 인기순, 마감임박순 + 마감된 펀딩 포함 체크박스) */}
            <SortBar sortBy={sortBy} onSortChange={setSortBy} isClosed={false} onIsClosedChange={() => {}} />
            {/* <SortBar sortBy={sortBy} onSortChange={setSortBy} isClosed={showClosed} onIsClosedChange={setShowClosed} /> */}

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
      <FilterBottomSheet
        isOpen={activeBottomSheet === 'category'}
        onClose={() => {
          // 취소 시 임시 상태를 원래 상태로 되돌림
          setTempSelectedMainCategoryId(selectedMainCategoryId);
          setTempSelectedSubCategoryIds([...selectedSubCategoryIds]);
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
  );
}
