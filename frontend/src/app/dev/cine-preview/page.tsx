'use client';

import React from 'react';
import {
  CineCard,
  Media,
  Progress,
  BarcodeDecor,
  PerforationLine,
  VoteBlock,
  FundingBlock,
  type FundingData,
  type VoteData,
} from '@/components/cards';

export default function CinePreviewPage() {
  // 샘플 펀딩 데이터
  const sampleFundingData: FundingData = {
    type: 'funding',
    funding: {
      fundingId: 1,
      title: '케이팝 데몬 헌터스',
      bannerUrl: '/images/image.png',
      state: 'ON_PROGRESS',
      progressRate: 100,
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
      videoName: '케이팝 데몬 헌터스',
      screeningTitle: '명작 <타이타닉> 봅시다!',
      screenStartsOn: 19,
      screenEndsOn: 21,
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
      fundingId: 101,
      title: '케이팝 데몬 헌터스',
      bannerUrl: '/images/image.png',
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
      videoName: '케이팝 데몬 헌터스',
      screeningTitle: '프로젝트 제목 어쩌고저쩌고 어...',
      screenStartsOn: '2025-10-01T19:00:00+09:00',
      screenEndsOn: '2025-10-01T21:00:00+09:00',
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
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-slate-50 text-center mb-12">Card Components Preview</h1>

        {/* 완전한 카드 컴포넌트 */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-slate-50 border-b border-slate-600 pb-2">
            Complete CineCard Components (백엔드 데이터 연동)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 펀딩 카드 */}
            <div>
              <p className="text-sm text-slate-400 mb-4">Funding Card</p>
              <CineCard
                data={sampleFundingData}
                onCardClick={(id) => console.log('Card clicked:', id)}
                onVoteClick={(id) => console.log('Vote clicked:', id)}
              />
            </div>

            {/* 투표 카드 */}
            <div>
              <p className="text-sm text-slate-400 mb-4">Vote Card</p>
              <CineCard
                data={sampleVoteData}
                onCardClick={(id) => console.log('Card clicked:', id)}
                onVoteClick={(id) => console.log('Vote clicked:', id)}
              />
            </div>
          </div>

          {/* 로딩 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-slate-400 mb-4">Loading State - Funding</p>
              <CineCard data={sampleFundingData} loadingState="loading" />
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-4">Loading State - Vote</p>
              <CineCard data={sampleVoteData} loadingState="loading" />
            </div>
          </div>
        </section>

        {/* Primitives Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-slate-50 border-b border-slate-600 pb-2">Primitives</h2>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Ready State</p>
                <Media src="/images/image.png" alt="영화 포스터" aspect="16/9" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Loading State</p>
                <Media src="" loadingState="loading" aspect="16/9" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Error State</p>
                <Media src="invalid-url" loadingState="error" aspect="16/9" />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">0%</p>
                <Progress value={0} showLabel />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">45%</p>
                <Progress value={45} showLabel />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">100%</p>
                <Progress value={100} showLabel />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Loading</p>
                <Progress value={0} showLabel loadingState="loading" />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-300">Different Heights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Height: 2px</p>
                  <Progress value={65} height={2} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Height: 6px</p>
                  <Progress value={65} height={6} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Height: 12px</p>
                  <Progress value={65} height={12} />
                </div>
              </div>
            </div>
          </div>

          {/* BarcodeDecor */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">BarcodeDecor</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Full Height</p>
                <div className="h-24 bg-slate-600 rounded flex items-center justify-center p-4">
                  <BarcodeDecor height="full" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">60px Height</p>
                <div className="h-24 bg-slate-600 rounded flex items-center justify-center p-4">
                  <BarcodeDecor height={60} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">40px Height</p>
                <div className="h-24 bg-slate-600 rounded flex items-center justify-center p-4">
                  <BarcodeDecor height={40} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-300">Different Sizes</h4>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Width: 16px</p>
                  <div className="h-16 bg-slate-600 rounded flex items-center justify-center p-2">
                    <BarcodeDecor width={16} height={50} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Width: 24px (default)</p>
                  <div className="h-16 bg-slate-600 rounded flex items-center justify-center p-2">
                    <BarcodeDecor width={24} height={50} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Width: 32px</p>
                  <div className="h-16 bg-slate-600 rounded flex items-center justify-center p-2">
                    <BarcodeDecor width={32} height={50} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PerforationLine */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">PerforationLine</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Default</p>
                <div className="bg-slate-700 rounded p-4">
                  <PerforationLine />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Thick Line (thickness: 3px)</p>
                <div className="bg-slate-700 rounded p-4">
                  <PerforationLine thickness={3} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Large Notches (width: 8px, height: 4px)</p>
                <div className="bg-slate-700 rounded p-4">
                  <PerforationLine notchWidth={8} notchHeight={4} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Custom Color (slate-600)</p>
                <div className="bg-slate-700 rounded p-4">
                  <PerforationLine notchColorClass="bg-slate-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">All Custom</p>
                <div className="bg-slate-700 rounded p-4">
                  <PerforationLine thickness={4} notchWidth={10} notchHeight={6} notchColorClass="bg-slate-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blocks Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-slate-50 border-b border-slate-600 pb-2">Blocks</h2>

          {/* VoteBlock */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">VoteBlock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-4">Default State</p>
                <VoteBlock likeCount={88888} onClick={() => alert('투표 보고싶어요 클릭!')} />
              </div>
              <div className="bg-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-4">Liked State</p>
                <VoteBlock likeCount={88888} isLiked={true} onClick={() => alert('투표 보고싶어요 취소!')} />
              </div>
              <div className="bg-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-4">Loading State</p>
                <VoteBlock likeCount={88888} loadingState="loading" />
              </div>
            </div>
          </div>

          {/* FundingBlock */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">FundingBlock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-4">100% Complete</p>
                <FundingBlock
                  price={88888}
                  progressRate={100}
                  participantCount={1888}
                  maxPeople={1888}
                  fundingEndsOn="2025-12-15T23:59:59+09:00"
                />
              </div>
              <div className="bg-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-4">50% Progress</p>
                <FundingBlock
                  price={25000}
                  progressRate={65}
                  participantCount={130}
                  maxPeople={200}
                  fundingEndsOn="2025-10-30T23:59:59+09:00"
                />
              </div>
              <div className="bg-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-4">Loading State</p>
                <FundingBlock
                  price={0}
                  progressRate={0}
                  participantCount={0}
                  maxPeople={0}
                  fundingEndsOn="2025-12-15T23:59:59+09:00"
                  loadingState="loading"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-300">Edge Cases & Variations</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-700 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-4">Almost Complete (95%)</p>
                  <FundingBlock
                    price={15000}
                    progressRate={95}
                    participantCount={95}
                    maxPeople={100}
                    fundingEndsOn="2025-09-20T23:59:59+09:00"
                  />
                </div>
                <div className="bg-slate-700 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-4">Just Started (5%)</p>
                  <FundingBlock
                    price={120000}
                    progressRate={5}
                    participantCount={12}
                    maxPeople={250}
                    fundingEndsOn="2025-11-30T23:59:59+09:00"
                  />
                </div>
                <div className="bg-slate-700 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-4">Expired (0 days left)</p>
                  <FundingBlock
                    price={35000}
                    progressRate={78}
                    participantCount={78}
                    maxPeople={100}
                    fundingEndsOn="2025-01-10T23:59:59+09:00"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
