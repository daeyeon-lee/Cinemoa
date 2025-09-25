"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserInfo, getFundingProposals, getParticipatedFunding, getLikedFunding } from '@/api/mypage';
import type { UserInfo, FundingProposal, ParticipatedFunding, LikedFunding } from '@/types/mypage';
import { useAuthStore } from '@/stores/authStore';
import type { CardItem } from '@/types/mypage';
import type { ApiSearchItem } from '@/types/searchApi';
import DetailHeader from './components/DetailHeader';
import FilterButtons, { type FilterOption } from './components/FilterButtons';
import EmptyState from './components/EmptyState';
import { ResponsiveCardList } from '@/components/lists/ResponsiveCardList';
import { InitialLoading } from './components/LoadingStates';
import { useFundingLike } from '@/hooks/queries/useFunding';

type SectionType = 'proposals' | 'participated' | 'liked';
type FilterType = 'funding' | 'vote' | 'ALL' | 'ON_PROGRESS' | 'CLOSE';

interface MyPageDetailProps {
  section: SectionType;
}

const MyPageDetail: React.FC<MyPageDetailProps> = ({ section }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') as FilterType || 'ALL';

  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 상태
  const [data, setData] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // 좋아요 토글을 위한 훅
  const likeMutation = useFundingLike();

  // 섹션별 설정
  const getSectionConfig = () => {
    switch (section) {
      case 'proposals':
        return {
          title: '내가 제안한 상영회',
          filters: [
            { key: 'ALL', label: '전체' },
            { key: 'funding', label: '펀딩' },
            { key: 'vote', label: '투표' }
          ]
        };
      case 'participated':
        return {
          title: '내가 참여한 상영회',
          filters: [
            { key: 'ALL', label: '전체' },
            { key: 'ON_PROGRESS', label: '진행중' },
            { key: 'CLOSE', label: '진행 완료' }
          ]
        };
      case 'liked':
        return {
          title: '내가 보고 싶은 상영회',
          filters: [
            { key: 'ALL', label: '전체' },
            { key: 'funding', label: '펀딩' },
            { key: 'vote', label: '투표' }
          ]
        };
      default:
        return {
          title: '',
          filters: []
        };
    }
  };

  const config = getSectionConfig();

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const { user, isLoggedIn } = useAuthStore.getState();

        if (!isLoggedIn() || !user?.userId) {
          setUserInfo({
            nickname: '사용자',
            profileImgUrl: 'https://placehold.co/72x72'
          });
          return;
        }

        const response = await getUserInfo(user.userId);
        const { nickname, profileImgUrl } = response.data as any;
        setUserInfo({
          nickname,
          profileImgUrl: profileImgUrl,
        });
      } catch (err) {
        console.error('사용자 정보 조회 오류:', err);
        setUserInfo({
          nickname: '사용자',
          profileImgUrl: 'https://placehold.co/72x72'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 데이터 조회 함수
  const fetchData = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const { user, isLoggedIn } = useAuthStore.getState();
      if (!isLoggedIn() || !user?.userId) {
        setData([]);
        setHasNextPage(false);
        return;
      }

      let response;
      if (section === 'proposals') {
        // 제안한 상영회: cursor 파라미터로 전송
        const type = filter === 'ALL' ? undefined : filter as 'funding' | 'vote';
        response = await getFundingProposals(user.userId, type, cursor, 24, 'cursor');
      } else if (section === 'participated') {
        // 참여한 상영회: cursor 파라미터로 전송
        const state = filter === 'ALL' ? undefined : filter as 'ON_PROGRESS' | 'CLOSE';
        response = await getParticipatedFunding(user.userId, state, cursor, 24, 'cursor');
      } else {
        // 보고 싶은 상영회: cursor 파라미터로 전송
        const type = filter === 'ALL' ? undefined : filter as 'funding' | 'vote';
        response = await getLikedFunding(user.userId, type, cursor, 24, 'cursor');
      }

      const newData = response.data.content || [];
      
      if (isLoadMore) {
        setData(prev => {
          // 중복 제거: fundingId 기준으로 중복 체크
          const existingIds = new Set(prev.map(item => item.funding?.fundingId));
          const uniqueNewData = newData.filter(item => !existingIds.has(item.funding?.fundingId));
          
          return [...prev, ...uniqueNewData];
          // 성능 개선을 위해 중복 제거 없이 바로 추가
          // 중복 제거 했었으나, 오류 발생. react에서 2번 요청을 보낸 것이 원인인 듯함
          // return [...prev, ...newData];
        });
      } else {
        setData(newData);
      }

      setHasNextPage(response.data.hasNextPage);
      setNextCursor(response.data.nextCursor || null);
      
    } catch (err) {
      console.error('데이터 조회 오류:', err);
      if (!isLoadMore) {
        setData([]);
        setHasNextPage(false);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [section, filter]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 필터 변경 시 데이터 재조회
  useEffect(() => {
    fetchData();
  }, [filter]);

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    if (isLoadingMore || !hasNextPage) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      
      if (nextCursor) {
        fetchData(nextCursor, true);
      }
    }
  }, [isLoadingMore, hasNextPage, nextCursor, fetchData, section]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilter: FilterType) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', newFilter);
    router.push(`?${params.toString()}`);
  };

  // 카드 클릭 핸들러
  const handleCardClick = (fundingId: number) => {
    router.push(`/detail/${fundingId}`);
  };

  // 좋아요 클릭 핸들러 - 마이페이지 디테일 데이터 직접 업데이트
  const handleVoteClick = (fundingId: number) => {
    const { user } = useAuthStore.getState();
    if (!user?.userId) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    // 현재 좋아요 상태 찾기
    const currentItem = data.find(item => item.funding.fundingId === fundingId);
    const currentIsLiked = currentItem?.funding?.isLiked || false;

    console.log('❤️ [MyPageDetail] 좋아요 토글:', { fundingId, currentIsLiked });

    // React Query mutation 실행
    likeMutation.mutate({
      fundingId,
      userId: String(user.userId),
      isLiked: currentIsLiked,
    });

    // 마이페이지 디테일 데이터 직접 업데이트
    setData(prevData => 
      prevData.map(item => {
        if (item.funding.fundingId === fundingId) {
          return {
            ...item,
            funding: {
              ...item.funding,
              isLiked: !currentIsLiked,
              favoriteCount: currentIsLiked 
                ? (item.funding.favoriteCount || 0) - 1 
                : (item.funding.favoriteCount || 0) + 1,
            }
          };
        }
        return item;
      })
    );
  };

  // CardItem을 ApiSearchItem으로 변환하는 함수
  const convertCardItemToApiSearchItem = (cardItem: CardItem): ApiSearchItem => {
    return {
      funding: {
        ...cardItem.funding,
        state: cardItem.funding.state as any,
        screenDate: cardItem.funding.screenDate || '',
      },
      cinema: cardItem.cinema,
    };
  };

  // 데이터를 CardItem 형식으로 변환
  const convertToCardData = (item: any): CardItem => {
    if (section === 'proposals') {
      return {
        funding: {
          ...item.funding,
        },
        cinema: {
          cinemaId: item.cinema.cinemaId,
          cinemaName: item.cinema.cinemaName,
          city: item.cinema.city,
          district: item.cinema.district,
        },
      };
    } else if (section === 'participated') {
      return {
        funding: {
          ...item.funding,
        },
        cinema: {
          cinemaId: item.cinema.cinemaId,
          cinemaName: item.cinema.cinemaName,
          city: item.cinema.city,
          district: item.cinema.district,
        },
      };
    } else {
      const fundingType = item.funding.price > 0 ? 'FUNDING' : 'VOTE';
      return {
        funding: {
          ...item.funding,
          fundingType: fundingType,
          screenMinDate: (item.funding as any).screenMinDate,
          screenMaxDate: (item.funding as any).screenMaxDate,
        } as any,
        cinema: {
          cinemaId: item.cinema.cinemaId,
          cinemaName: item.cinema.cinemaName,
          city: item.cinema.city,
          district: item.cinema.district,
        },
      };
    }
  };

  // state에 따른 뱃지 색상과 문구 매핑
  const getStateBadgeInfo = (state: string, fundingType: 'FUNDING' | 'VOTE') => {
    switch (state) {
      case 'SUCCESS':
        return { text: '성공', className: 'bg-emerald-400 text-slate-900' };
      case 'EVALUATING':
        return { text: '심사중', className: 'bg-amber-300 text-slate-900' };
      case 'REJECTED':
        return { text: '반려됨', className: 'bg-red-500 text-white' };
      case 'WAITING':
        return { text: '대기중', className: 'bg-amber-300 text-slate-900' };
      case 'ON_PROGRESS':
        return { text: fundingType === 'FUNDING' ? '진행중' : '진행중', className: 'bg-cyan-400 text-slate-900' };
      case 'FAILED':
        return { text: '실패', className: 'bg-red-500 text-white' };
      case 'VOTING':
        return { text: '진행중', className: 'bg-cyan-400 text-slate-900' };
      default:
        return { text: '알 수 없음', className: 'bg-slate-500 text-white' };
    }
  };

  const handleActionClick = () => {
    const routes = {
      proposals: '/create',
      participated: '/',
      liked: '/category'
    };
    router.push(routes[section]);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
      <DetailHeader 
        title={config.title}
        userNickname={userInfo?.nickname}
        isLoading={isLoading}
      />

      <FilterButtons 
        filters={config.filters as FilterOption[]}
        currentFilter={filter}
        onFilterChange={handleFilterChange}
      />

      <InitialLoading isLoading={isLoading} />

      {!isLoading && data.length === 0 && (
        <EmptyState 
          title={config.title}
          section={section}
          onActionClick={handleActionClick}
        />
      )}

      {!isLoading && data.length > 0 && (
        <ResponsiveCardList
          items={data.map(convertToCardData).map(convertCardItemToApiSearchItem)}
          mode="funding"
          loading={false}
          empty={false}
          error={false}
          onCardClick={handleCardClick}
          onVoteClick={handleVoteClick}
          onLoadMore={() => {
            if (nextCursor) {
              fetchData(nextCursor, true);
            }
          }}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isLoadingMore}
        />
      )}
    </div>
  );
};

export default MyPageDetail;
