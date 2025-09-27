'use client';

import { Button } from '@/components/ui/button';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import FilterButtonGroup, { type FilterOption } from '@/app/(main)/mypage/components/FilterButtonGroup';
import EmptyStateCard from '@/app/(main)/mypage/components/EmptyStateCard';
import type { CardItem } from '@/types/mypage';
import type { ApiSearchItem } from '@/types/searchApi';
import type { ParticipatedFunding } from '@/types/mypage';
import { useRouter } from 'next/navigation';

interface ParticipatedSectionProps {
  myParticipated: ParticipatedFunding[];
  isParticipatedLoading: boolean;
  participatedState: 'ALL' | 'ON_PROGRESS' | 'CLOSE' | undefined;
  setParticipatedState: (state: 'ALL' | 'ON_PROGRESS' | 'CLOSE' | undefined) => void;
  handleCardClick: (fundingId: number) => void;
  handleVoteClick: (fundingId: number) => void;
  getStateBadgeInfo: (state: string, fundingType: 'FUNDING' | 'VOTE') => { text: string; className: string };
}

export default function ParticipatedSection({
  myParticipated,
  isParticipatedLoading,
  participatedState,
  setParticipatedState,
  handleCardClick,
  handleVoteClick,
  getStateBadgeInfo,
}: ParticipatedSectionProps) {
  const router = useRouter();

  // 필터 옵션 정의
  const filterOptions: FilterOption<'ALL' | 'ON_PROGRESS' | 'CLOSE' | undefined>[] = [
    { value: undefined, label: '전체' },
    { value: 'ON_PROGRESS', label: '진행 중' },
    { value: 'CLOSE', label: '진행 완료' },
  ];

  // 필터에 따른 빈 상태 메시지
  const getEmptyMessage = () => {
    switch (participatedState) {
      case 'ON_PROGRESS':
        return {
          title: '진행 중인 펀딩이 없습니다',
          subtitle: '상영회에 참여해보세요',
          buttonText: '상영회 보러가기',
          buttonLink: '/'
        };
      case 'CLOSE':
        return {
          title: '완료된 상영회가 없습니다',
          subtitle: '상영회에 참여해보세요',
          buttonText: '상영회 보러가기',
          buttonLink: '/'
        };
      default:
        return {
          title: '참여한 펀딩이 없습니다',
          subtitle: '상영회에 참여해보세요',
          buttonText: '상영회 보러가기',
          buttonLink: '/'
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

  // 참여한 상영회 데이터를 CardItem 형식으로 변환
  const convertParticipatedToCardData = (participated: ParticipatedFunding): CardItem => {
    return {
      funding: {
        ...participated.funding,
        state: participated.funding.state as any,
        screenDate: participated.funding.screenDate || '',
      },
      cinema: {
        cinemaId: participated.cinema.cinemaId,
        cinemaName: participated.cinema.cinemaName,
        city: participated.cinema.city,
        district: participated.cinema.district,
      },
    };
  };


  return (
    <div className="w-full flex flex-col justify-start items-start gap-2.5">
      {/* 섹션 헤더 */}
      <div className="w-full flex items-center justify-between">
        <h2 className="text-h5-b">내가 참여한 펀딩</h2>
        <button onClick={() => router.push('/mypage/detail/participated')} className="text-h6-b text-secondary">
          더보기 →
        </button>
      </div>
      {/* 필터 버튼 그룹 */}
      <FilterButtonGroup
        options={filterOptions}
        selectedValue={participatedState}
        onValueChange={setParticipatedState}
      />
      {/* 상영회 카드 */}
      <div className="self-stretch inline-flex justify-start items-center gap-2 overflow-hidden">
        {myParticipated.length === 0 ? (
          <EmptyStateCard
            title={getEmptyMessage().title}
            subtitle={getEmptyMessage().subtitle}
            buttonText={getEmptyMessage().buttonText}
            buttonLink={getEmptyMessage().buttonLink}
          />
        ) : (
          <HorizontalScroller className="w-full">
            {myParticipated.map((participated, index) => (
              <div key={participated.funding.fundingId} className="w-[172px] flex-shrink-0 h-[400px]">
                <CineCardVertical
                  data={convertCardItemToApiSearchItem(convertParticipatedToCardData(participated))}
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
