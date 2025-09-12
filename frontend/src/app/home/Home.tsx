'use client';

import { CineCardVertical } from '@/components/cards/CineCardVertical';
import { CineCardHorizontal } from '@/components/cards/CineCardHorizontal';

const sampleCardData = {
  funding: {
    fundingId: 1,
    title: '샘플 영화',
    bannerUrl: '/api/placeholder/400/600',
    state: 'ACTIVE',
    progressRate: 75,
    fundingEndsOn: '2024-12-31T23:59:59',
    screenDate: '2025-01-15T19:00:00',
    price: 15000,
    maxPeople: 200,
    participantCount: 150,
    favoriteCount: 89,
    isLiked: false,
    fundingType: 'FUNDING' as const,
  },
  cinema: {
    cinemaId: 1,
    cinemaName: 'CGV 강남',
    city: '서울',
    district: '강남구',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Grid Layout */}
        <div className="grid grid-cols-12 grid-rows-auto gap-6 h-full">
          {/* Header - Full Width (1) */}
          <div className="col-span-12 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white font-['Pretendard']">씨네모아</h1>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-8">
                <input
                  type="text"
                  placeholder="영화 제목, 장르 검색..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-Brand1-Primary"
                />
              </div>

              {/* Category Buttons */}
              <div className="flex gap-2">
                {['전체', '영화', '시리즈', '중계', '공연'].map((category) => (
                  <button
                    key={category}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-Brand1-Primary transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Left Column - Spans 8 columns */}
          <div className="col-span-8 space-y-6">
            {/* 추천 상영회 (2) - 8개를 2줄로, 세로 카드 */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-white">추천 상영회</h2>
              <div className="grid grid-cols-4 gap-4">
                {Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="w-full">
                      <CineCardVertical data={sampleCardData} loadingState="loading" />
                    </div>
                  ))}
              </div>
            </div>

            {/* 종료 임박 상영회 (4) - 한 줄만, 세로 카드 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white font-['Pretendard']">종료 임박 상영회</h2>
                <button className="text-slate-500 text-sm">더보기 →</button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="w-full">
                      <CineCardVertical data={sampleCardData} loadingState="loading" />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column - Spans 4 columns, 인기 상영회 (3) - 가로 카드 */}
          <div className="col-span-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white font-['Pretendard']">인기 상영회</h2>
              </div>
              <h1></h1>
              <div className="space-y-3">
                {Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="w-full">
                      <CineCardHorizontal data={sampleCardData} loadingState="loading" />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 최근 본 상영회 (5) - Full Width, 세로 카드 */}
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white font-['Pretendard']">최근 본 상영회</h2>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="w-full">
                    <CineCardVertical data={sampleCardData} loadingState="loading" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
