'use client';

import React from 'react';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import { CineCardHorizontal } from '@/components/cards/CineCardHorizontal';
import { CineDetailCard, type FundingDetailData, type VoteDetailData } from '@/components/cards/CineDetailCard';
import type { FundingData, VoteData } from '@/components/cards/CineCardVertical';

export default function CinePreviewPage() {
  // 목록용 샘플 펀딩 데이터
  const sampleFundingData: FundingData = {
    funding: {
      fundingId: 1,
      title: '뮤지컬 라이온킹 단체관람',
      bannerUrl: 'https://placehold.co/400x600',
      state: 'ON_PROGRESS',
      progressRate: 88,
      fundingEndsOn: '2025-10-08',
      screenDate: '2025-10-15',
      price: 8000,
      maxPeople: 50,
      participantCount: 44,
      favoriteCount: 232,
      isLiked: true,
      fundingType: 'FUNDING',
    },
    cinema: {
      cinemaId: 1,
      cinemaName: 'CGV대학로',
      city: '서울시',
      district: '종로구',
    },
  };

  // 목록용 샘플 투표 데이터
  const sampleVoteData: VoteData = {
    funding: {
      fundingId: 2,
      title: '어벤져스: 엔드게임 단체관람',
      bannerUrl: 'https://placehold.co/400x600',
      state: 'ON_PROGRESS',
      progressRate: 0,
      fundingEndsOn: '2025-10-12',
      screenDate: '2025-10-20',
      price: 12000,
      maxPeople: 100,
      participantCount: 0,
      favoriteCount: 456,
      isLiked: false,
      fundingType: 'VOTE',
    },
    cinema: {
      cinemaId: 2,
      cinemaName: '메가박스 홍대',
      city: '서울시',
      district: '마포구',
    },
  };

  // 디테일용 샘플 펀딩 데이터
  const sampleDetailFundingData: FundingDetailData = {
    type: 'funding',
    funding: {
      fundingId: 1,
      title: '타이타닉',
      bannerUrl: 'https://placehold.co/1004x420',
      content: '명작 <타이타닉>을 대형 스크린에서 함께 봅시다!',
      state: 'ON_PROGRESS',
      progressRate: 80,
      fundingEndsOn: '2025-12-15T23:59:59+09:00',
      price: 10000,
    },
    proposer: {
      proposerId: 2,
      creatorNickname: '당근123',
    },
    screening: {
      videoName: '타이타닉',
      screeningTitle: '명작 <타이타닉> 봅시다!',
      screenStartsOn: 19,
      screenEndsOn: 21,
    },
    stat: {
      maxPeople: 100,
      participantCount: 80,
      viewCount: 144,
      likeCount: 34,
      isLiked: true,
    },
    metadata: {
      categoryId: 1,
      recommendationScore: 13,
    },
    screen: {
      screenId: 1,
      screenName: '범계 롯데시네마 7관',
    },
    cinema: {
      cinemaId: 1,
      cinemaName: '안양(범계) 롯데시네마',
      city: '안양시',
      district: '동안구',
    },
  };

  // 디테일용 샘플 투표 데이터
  const sampleDetailVoteData: VoteDetailData = {
    type: 'vote',
    vote: {
      fundingId: 2,
      title: '어벤져스: 엔드게임',
      bannerUrl: 'https://placehold.co/1004x420',
      content: '마블 최고의 대작을 함께 봐요!',
      state: 'ON_PROGRESS',
      fundingStartsOn: '2025-08-25T14:30:00+09:00',
      fundingEndsOn: '2025-12-20T23:59:59+09:00',
    },
    proposer: {
      proposerId: 3,
      creatorNickname: '영화매니아',
    },
    screening: {
      videoName: '어벤져스: 엔드게임',
      screeningTitle: '마블 최고의 대작을 함께 봐요!',
      screenStartsOn: '2025-09-20T20:00:00+09:00',
      screenEndsOn: '2025-09-20T23:00:00+09:00',
    },
    participation: {
      viewCount: 500,
      likeCount: 1234,
      isLike: false,
    },
    metadata: {
      categoryId: 1,
      recommendationScore: 18,
    },
    cinema: {
      cinemaId: 2,
      cinemaName: 'CGV 강남',
      city: '서울시',
      district: '강남구',
      lat: 37.5665,
      lng: 126.9780,
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-slate-50 text-center mb-12">CineCard Components Preview</h1>

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
              <CineCardVertical data={sampleFundingData} loadingState="loading" />
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
              <CineCardHorizontal data={sampleFundingData} loadingState="loading" />
            </div>

            {/* 에러 상태 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">에러 상태 (Error)</p>
              <CineCardHorizontal data={sampleVoteData} loadingState="error" />
            </div>
          </div>
        </section>

        {/* 디테일 카드 */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-slate-50 border-b border-slate-600 pb-2">
            디테일 카드 (Detail Cards)
          </h2>

          <div className="space-y-12">
            {/* 펀딩 디테일 카드 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">펀딩 디테일 카드</p>
              <CineDetailCard
                data={sampleDetailFundingData}
                onPrimaryAction={() => console.log('펀딩 참여하기 clicked')}
                onSecondaryAction={() => console.log('좋아요 clicked')}
              />
            </div>

            {/* 투표 디테일 카드 */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400">투표 디테일 카드</p>
              <CineDetailCard
                data={sampleDetailVoteData}
                onPrimaryAction={() => console.log('보고싶어요 clicked')}
                onSecondaryAction={() => console.log('공유 clicked')}
              />
            </div>

            {/* 로딩 상태 */}
            {/* <div className="space-y-4">
              <p className="text-sm text-slate-400">로딩 상태</p>
              <CineDetailCard data={sampleDetailFundingData} loadingState="loading" />
            </div> */}
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
              <CineCardVertical data={sampleFundingData} onCardClick={(id) => console.log('Vertical clicked:', id)} />
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
