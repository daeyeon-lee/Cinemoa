import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSearch } from '@/hooks/queries/useSearch';
import { findCategoryValueById } from '@/constants/categories';
import type { SearchParams, SortBy } from '@/types/searchApi';

/**
 * 카테고리 페이지 필터링 로직을 관리하는 커스텀 훅
 *
 * @description 카테고리, 지역, 상영관 종류 등의 필터 상태와
 * API 요청 파라미터 생성, 이벤트 핸들러들을 관리합니다.
 */
export const useCategoryFilters = () => {
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

  // 바텀시트 상태 관리
  const [activeBottomSheet, setActiveBottomSheet] = useState<'category' | 'region' | 'theater' | null>(null);

  // ========== 초기화: localStorage에서 카테고리 정보 복원 ==========
  useEffect(() => {
    const savedCategoryId = localStorage.getItem('selectedCategoryId');

    if (savedCategoryId) {
      const categoryId = parseInt(savedCategoryId, 10);
      // console.log('🎯 [useCategoryFilters] localStorage에서 categoryId 감지:', categoryId);

      // 1차 카테고리 선택 (ex: categoryId=1이면 영화 전체 선택)
      // ID 1=영화, 2=시리즈, 3=공연, 4=스포츠중계
      setSelectedMainCategoryId(categoryId);
      setSelectedUiCategoryId(categoryId);
      setSelectedSubCategoryId(categoryId);

      // console.log('✅ [useCategoryFilters] 카테고리 초기화 완료:', {
        selectedMainCategoryId: categoryId,
        selectedUiCategoryId: categoryId,
        selectedSubCategoryId: categoryId,
      });

      // 사용 후 localStorage 정리 (일회성 사용)
      localStorage.removeItem('selectedCategoryId');
    }
  }, []);

  // ========== API 요청 파라미터 생성 ==========
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
      // theaterTypes 배열은 컴포넌트에서 전달받아야 함
      params.theaterType = selectedTheaterType;
    }

    // ========== 마감된 펀딩 포함 여부 ==========
    // 기본값(false)이 아닐 때만 API에 전달
    if (showClosed) {
      params.isClosed = showClosed;
    }

    return params;
  }, [sortBy, selectedUiCategoryId, selectedMainCategoryId, selectedSubCategoryId, selectedRegions, selectedTheaterType, showClosed, user?.userId]);

  // ========== 데이터 조회 ==========
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useSearch(searchParams);

  // ========== 이벤트 핸들러들 ==========

  /**
   * 필터 초기화 핸들러
   */
  const handleResetFilters = useCallback(() => {
    setSelectedMainCategoryId(null);
    setSelectedUiCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedRegions([]);
    setSelectedTheaterType([]);
    setSortBy('LATEST');
    setShowClosed(false);
  }, []);

  /**
   * API 재시도 핸들러
   */
  const handleRetry = useCallback(() => {
    // console.log('🔄 [useCategoryFilters] 재시도 버튼 클릭');
    refetch();
  }, [refetch]);

  /**
   * 무한스크롤 로드 더보기 핸들러
   */
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      // console.log('📋 [useCategoryFilters] 다음 페이지 로드');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * 펀딩 카드 클릭 핸들러
   */
  const handleCardClick = useCallback(
    (id: number) => {
      // console.log('🎯 [useCategoryFilters] 펀딩 카드 클릭:', id);
      router.push(`/detail/${id}`);
    },
    [router],
  );

  /**
   * 좋아요(하트) 버튼 클릭 핸들러
   */
  const handleVoteClick = useCallback((id: number) => {
    // console.log('❤️ [useCategoryFilters] 좋아요 버튼 클릭:', id);
    // TODO: 좋아요 토글 로직 구현
  }, []);

  /**
   * 바텀시트 필터 적용 핸들러
   */
  const handleFilterApply = useCallback(() => {
    // console.log('🔄 [useCategoryFilters] 필터 적용');
    // 필터가 적용되면 searchParams가 변경되어 자동으로 데이터 리패치됨
  }, []);

  /**
   * 카테고리 변경 핸들러 (모바일용)
   */
  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedMainCategoryId(categoryId);
    setSelectedUiCategoryId(categoryId);
    setSelectedSubCategoryId(categoryId);
  }, []);

  // API에서 받아온 모든 페이지의 아이템들을 평탄화한 배열
  const items = data?.content || [];

  return {
    // 상태들
    selectedMainCategoryId,
    selectedUiCategoryId,
    selectedSubCategoryId,
    selectedRegions,
    selectedTheaterType,
    sortBy,
    showClosed,
    activeBottomSheet,

    // 상태 변경 함수들
    setSelectedMainCategoryId,
    setSelectedUiCategoryId,
    setSelectedSubCategoryId,
    setSelectedRegions,
    setSelectedTheaterType,
    setSortBy,
    setShowClosed,
    setActiveBottomSheet,

    // 데이터
    items,
    data,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,

    // 핸들러들
    handleResetFilters,
    handleRetry,
    handleLoadMore,
    handleCardClick,
    handleVoteClick,
    handleFilterApply,
    handleCategoryChange,
  };
};