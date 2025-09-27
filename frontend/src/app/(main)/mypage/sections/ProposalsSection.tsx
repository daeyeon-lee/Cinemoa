'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import FilterButtonGroup, { type FilterOption } from '@/app/(main)/mypage/components/FilterButtonGroup';
import EmptyStateCard from '@/app/(main)/mypage/components/EmptyStateCard';
import type { CardItem } from '@/types/mypage';
import type { ApiSearchItem } from '@/types/searchApi';
import type { FundingProposal } from '@/types/mypage';
import { useRouter } from 'next/navigation';

interface ProposalsSectionProps {
  myProposals: FundingProposal[];
  isProposalsLoading: boolean;
  proposalType: 'funding' | 'vote' | undefined;
  setProposalType: (type: 'funding' | 'vote' | undefined) => void;
  handleCardClick: (fundingId: number) => void;
  handleVoteClick: (fundingId: number) => void;
  getStateBadgeInfo: (state: string, fundingType: 'FUNDING' | 'VOTE') => { text: string; className: string };
}

export default function ProposalsSection({
  myProposals,
  isProposalsLoading,
  proposalType,
  setProposalType,
  handleCardClick,
  handleVoteClick,
  getStateBadgeInfo,
}: ProposalsSectionProps) {
  const router = useRouter();

  // 필터 옵션 정의
  const filterOptions: FilterOption<'funding' | 'vote' | undefined>[] = [
    { value: undefined, label: '전체' },
    { value: 'funding', label: '상영회' },
    { value: 'vote', label: '수요조사' },
  ];

  // 필터에 따른 빈 상태 메시지
  const getEmptyMessage = () => {
    switch (proposalType) {
      case 'funding':
        return {
          title: '내가 제안한 상영회가 없습니다',
          subtitle: '프로젝트를 시작해보세요',
          buttonText: '프로젝트 생성하기',
          buttonLink: '/create'
        };
      case 'vote':
        return {
          title: '내가 제안한 수요조사가 없습니다',
          subtitle: '프로젝트를 시작해보세요',
          buttonText: '프로젝트 생성하기',
          buttonLink: '/create'
        };
      default:
        return {
          title: '내가 제안한 펀딩이 없습니다',
          subtitle: '프로젝트를 시작해보세요',
          buttonText: '프로젝트 생성하기',
          buttonLink: '/create'
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

  // 내가 제안한 상영회 데이터를 CardItem 형식으로 변환
  const convertToCardData = (proposal: FundingProposal): CardItem => {
    return {
      funding: {
        ...proposal.funding,
        state: proposal.funding.state as any,
        screenDate: proposal.funding.screenDate || '',
      },
      cinema: {
        cinemaId: proposal.cinema.cinemaId,
        cinemaName: proposal.cinema.cinemaName,
        city: proposal.cinema.city,
        district: proposal.cinema.district,
      },
    };
  };

  return (
    <div className="w-full flex flex-col justify-start items-start gap-2.5">
      {/* 섹션 헤더 */}
      <div className="w-full flex items-center justify-between">
        <h2 className="text-h5-b">내가 제안한 펀딩</h2>
        <button onClick={() => router.push('/mypage/detail/proposals')} className="text-h6-b text-secondary ">
          더보기 →
        </button>
      </div>
      {/* 필터 버튼 그룹 */}
      <FilterButtonGroup
        options={filterOptions}
        selectedValue={proposalType}
        onValueChange={setProposalType}
      />
      {/* 상영회 카드 */}
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        {myProposals.length === 0 ? (
          <EmptyStateCard
            title={getEmptyMessage().title}
            subtitle={getEmptyMessage().subtitle}
            buttonText={getEmptyMessage().buttonText}
            buttonLink={getEmptyMessage().buttonLink}
          />
        ) : (
          <HorizontalScroller className="w-full">
            {myProposals.map((proposal, index) => (
              <div key={proposal.funding.fundingId} className="w-[172px] flex-shrink-0 h-[400px]">
                <CineCardVertical
                  data={convertCardItemToApiSearchItem(convertToCardData(proposal))}
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
