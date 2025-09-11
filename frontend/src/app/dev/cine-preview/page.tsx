'use client';

import React from 'react';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import { CineCardHorizontal } from '@/components/cards/CineCardHorizontal';
import type { FundingData, VoteData } from '@/components/cards/CineCardVertical';

export default function CinePreviewPage() {
  // 샘플 펀딩 데이터
  const sampleFundingData: FundingData = {
    type: 'funding',
    funding: {
      fundingId: 1,
      title: '케이팝 데몬 헌터스',
      bannerUrl: 'https://placehold.co/400x600',
      state: 'ON_PROGRESS',
      progressRate: 88,
      isClosed: false,
      fundingStartsOn: '2025-08-25T14:30:00+09:00',
      fundingEndsOn: '2025-12-15T23:59:59+09:00',
      price: 88888,
    },
    proposer: {
      proposerId: 2,
      creatorNickname: '당근123',
    },
    screening: {
      videoName: '영화 제목 영화 제목 영화 제목 영화 제목',
      screeningTitle: '프로젝트 제목 어쩌고저쩌고 어쩌고저쩌고',
      screenStartsOn: 1703952000000, // 2023-12-30
      screenEndsOn: 1703959200000,
      cinema: {
        cinemaName: 'CGV 강남',
        theaterType: 'imax',
        region: 'seoul',
      },
    },
    participation: {
      participantCount: 1888,
      maxPeople: 1888,
      viewCount: 1250,
      likeCount: 43,
      isLike: true,
    },
    metadata: {
      categoryId: 12,
      recommendationScore: 13,
    },
  };

  // 샘플 투표 데이터
  const sampleVoteData: VoteData = {
    type: 'vote',
    vote: {
      voteId: 101,
      title: '케이팝 데몬 헌터스',
      bannerUrl: 'https://placehold.co/400x600',
      state: 'ON_PROGRESS',
      isClosed: false,
      fundingStartsOn: '2025-08-25T14:30:00+09:00',
      fundingEndsOn: '2025-12-15T23:59:59+09:00',
    },
    proposer: {
      proposerId: 202,
      proposerNickname: '당근456',
    },
    screening: {
      videoName: '영화 제목 영화 제목 영화 제목 영화 제목',
      screeningTitle: '프로젝트 제목 어쩌고저쩌고 어쩌고저쩌고',
      screenStartsOn: 1703952000000, // 2023-12-30
      screenEndsOn: 1703959200000,
      cinema: {
        cinemaName: '메가박스 홍대',
        cinemaType: 'general',
        region: 'seoul',
      },
    },
    participation: {
      participantCount: 180,
      maxPeople: 250,
      viewCount: 8300,
      likeCount: 99999,
      isLike: false,
    },
    metadata: {
      categoryId: 15,
      recommendationScore: 18,
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-slate-50 text-center mb-12">
          CineCard Components Preview
        </h1>

        {/* 세로형 카드 */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-slate-50 border-b border-slate-600 pb-2">
            세로형 카드 (Vertical Cards)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 펀딩 카드 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">펀딩 카드 (Funding)</p>
              <CineCardVertical
                data={sampleFundingData}
                onCardClick={(id) => console.log('Funding card clicked:', id)}
                onVoteClick={(id) => console.log('Vote clicked:', id)}
              />
            </div>

            {/* 투표 카드 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">투표 카드 (Vote)</p>
              <CineCardVertical
                data={sampleVoteData}
                onCardClick={(id) => console.log('Vote card clicked:', id)}
                onVoteClick={(id) => console.log('Vote clicked:', id)}
              />
            </div>

            {/* 로딩 상태 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">로딩 상태 (Loading)</p>
              <CineCardVertical
                data={sampleFundingData}
                loadingState="loading"
              />
            </div>
          </div>
        </section>

        {/* 가로형 카드 */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-slate-50 border-b border-slate-600 pb-2">
            가로형 카드 (Horizontal Cards)
          </h2>
          
          <div className="space-y-6">
            {/* 펀딩 카드 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">펀딩 카드 (Funding)</p>
              <CineCardHorizontal
                data={sampleFundingData}
                onCardClick={(id) => console.log('Horizontal funding card clicked:', id)}
                onVoteClick={(id) => console.log('Vote clicked:', id)}
              />
            </div>

            {/* 투표 카드 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">투표 카드 (Vote)</p>
              <CineCardHorizontal
                data={sampleVoteData}
                onCardClick={(id) => console.log('Horizontal vote card clicked:', id)}
                onVoteClick={(id) => console.log('Vote clicked:', id)}
              />
            </div>

            {/* 로딩 상태 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">로딩 상태 (Loading)</p>
              <CineCardHorizontal
                data={sampleFundingData}
                loadingState="loading"
              />
            </div>

            {/* 에러 상태 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">에러 상태 (Error)</p>
              <CineCardHorizontal
                data={sampleVoteData}
                loadingState="error"
              />
            </div>
          </div>
        </section>

        {/* 비교 섹션 */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-slate-50 border-b border-slate-600 pb-2">
            세로형 vs 가로형 비교 (Side by Side Comparison)
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-lg text-slate-300">세로형 펀딩 카드</p>
              <CineCardVertical
                data={sampleFundingData}
                onCardClick={(id) => console.log('Vertical clicked:', id)}
              />
            </div>
            
            <div className="space-y-4">
              <p className="text-lg text-slate-300">가로형 펀딩 카드</p>
              <CineCardHorizontal
                data={sampleFundingData}
                onCardClick={(id) => console.log('Horizontal clicked:', id)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}