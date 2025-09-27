'use client';

import { Button } from '@/components/ui/button';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import FilterButtonGroup, { type FilterOption } from '@/app/(main)/mypage/components/FilterButtonGroup';
import EmptyStateCard from '@/app/(main)/mypage/components/EmptyStateCard';
import type { CardItem } from '@/types/mypage';
import type { ApiSearchItem } from '@/types/searchApi';
import type { LikedFunding } from '@/types/mypage';
import { useRouter } from 'next/navigation';

interface LikedSectionProps {
  myLiked: LikedFunding[];
  isLikedLoading: boolean;
  likedType: 'funding' | 'vote' | undefined;
  setLikedType: (type: 'funding' | 'vote' | undefined) => void;
  handleCardClick: (fundingId: number) => void;
  handleVoteClick: (fundingId: number) => void;
  getStateBadgeInfo: (state: string, fundingType: 'FUNDING' | 'VOTE') => { text: string; className: string };
}

export default function LikedSection({
  myLiked,
  isLikedLoading,
  likedType,
  setLikedType,
  handleCardClick,
  handleVoteClick,
  getStateBadgeInfo,
}: LikedSectionProps) {
  const router = useRouter();

  // 필터 옵션 정의
  const filterOptions: FilterOption<'funding' | 'vote' | undefined>[] = [
    { value: undefined, label: '전체' },
    { value: 'funding', label: '상영회' },
    { value: 'vote', label: '수요조사' },
  ];

  // 필터에 따른 빈 상태 메시지
  const getEmptyMessage = () => {
    switch (likedType) {
      case 'funding':
        return {
          title: '보고 싶은 상영회가 없습니다',
          subtitle: '보고 싶은 상영회를 저장해보세요',
          buttonText: '상영회 보러가기',
          buttonLink: '/category'
        };
      case 'vote':
        return {
          title: '보고 싶은 수요조사가 없습니다',
          subtitle: '보고 싶은 수요조사를 저장해보세요',
          buttonText: '상영회 보러가기',
          buttonLink: '/category'
        };
      default:
        return {
          title: '보고 싶은 펀딩이 없습니다',
          subtitle: '보고 싶은 펀딩을 저장해보세요',
          buttonText: '상영회 보러가기',
          buttonLink: '/category'
        };
    }
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

  // 보고싶어요 한 상영회 데이터를 CardItem 형식으로 변환
  const convertLikedToCardData = (liked: LikedFunding): CardItem => {
    // price가 0보다 크면 FUNDING, 아니면 VOTE로 구분
    const fundingType = liked.funding.price > 0 ? 'FUNDING' : 'VOTE';

    return {
      funding: {
        ...liked.funding,
        fundingType: fundingType,
        state: liked.funding.state as any,
        screenDate: liked.funding.screenDate || '',
      },
      cinema: {
        cinemaId: liked.cinema.cinemaId,
        cinemaName: liked.cinema.cinemaName,
        city: liked.cinema.city,
        district: liked.cinema.district,
      },
    };
  };


  return (
    <div className="w-full flex flex-col justify-start items-start gap-2.5">
      {/* 섹션 헤더 */}
      <div className="w-full flex items-center justify-between">
        <h2 className="text-h5-b">내가 보고 싶은 펀딩</h2>
        <button onClick={() => router.push('/mypage/detail/liked')} className="text-h6-b text-secondary hover:text-slate-400 transition-colors">
          더보기 →
        </button>
      </div>
      {/* 필터 버튼 그룹 */}
      <FilterButtonGroup
        options={filterOptions}
        selectedValue={likedType}
        onValueChange={setLikedType}
      />
      {/* 상영회 카드 */}
      <div className="self-stretch inline-flex justify-start items-center gap-2 overflow-hidden">
        {!myLiked || myLiked.length === 0 ? (
          <EmptyStateCard
            title={getEmptyMessage().title}
            subtitle={getEmptyMessage().subtitle}
            buttonText={getEmptyMessage().buttonText}
            buttonLink={getEmptyMessage().buttonLink}
          />
        ) : (
          <HorizontalScroller className="w-full">
            {myLiked &&
              myLiked.map((liked, index) => (
                <div key={liked.funding.fundingId} className="w-[172px] flex-shrink-0 h-[400px]">
                  <CineCardVertical
                    data={convertCardItemToApiSearchItem(convertLikedToCardData(liked))}
                    onCardClick={handleCardClick}
                    onVoteClick={handleVoteClick}
                    showStateTag={true}
                    stateTagClassName="state state-active"
                    getStateBadgeInfo={getStateBadgeInfo}
                  />
                </div>
              ))}
          </HorizontalScroller>
        )}
      </div>
    </div>
  );
}
