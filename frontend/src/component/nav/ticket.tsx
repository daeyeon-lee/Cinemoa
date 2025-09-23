'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Media } from '@/components/cards/primitives/Media';
import Image from 'next/image';

interface TicketProps {
  // 영화 정보
  title?: string;
  subtitle?: string;
  posterUrl?: string;
  categoryName?: string;

  // 상영 정보
  cinemaName?: string;
  screenName?: string;
  screenDate?: string;
  screenTime?: string;
  seatInfo?: string;

  // 결제 정보
  price?: number;
  participantCount?: number;

  // 펀딩 정보
  fundingId?: number;
  createdAt?: string;
}

export default function Ticket({
  title = 'Avengers: Endgame',
  subtitle = '어벤져스: 엔드게임',
  posterUrl = '5Zxdorl5TharlI9S47YxoKzGCsi.webp',
  categoryName = '영화',
  cinemaName = 'CGV 강남',
  screenName = '1관',
  screenDate = '2024.12.25',
  screenTime = '19:00',
  seatInfo = 'A열 12번',
  price = 15000,
  participantCount = 1,
  fundingId = 126,
  createdAt = '2024.11.20',
}: TicketProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  return (
    <div className="w-full max-w-sm mx-auto max-h-[100vh] overflow-hidden">
      {/* 플립 카드 컨테이너 */}
      <div className="relative w-full h-[500px] perspective-1000">
        <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`} onClick={handleFlip}>
          {/* 앞면 - 포스터 */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="bg-BG-2 rounded-2xl overflow-hidden shadow-2xl relative border-2 border-stroke-4 h-full">
              {/* 포스터 영역 */}
              <div className="relative h-full overflow-hidden">
                <img src={posterUrl || ''} alt={title || ''} className="w-full h-full object-cover" />

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

                {/* 영화 제목 오버레이 */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold drop-shadow-lg">{title}</h3>
                  <p className="text-lg opacity-90">{subtitle}</p>
                </div>

                {/* 클릭 안내 */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">클릭하여 정보 보기</div>
              </div>
            </div>
          </div>

          {/* 뒷면 - 영화 정보 */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="bg-BG-2 rounded-2xl overflow-hidden shadow-2xl relative border-2 border-stroke-4 h-full">
              {/* 영화 정보 영역 */}
              <div className="p-6 h-full flex flex-col justify-between">
                {/* 상단 정보 */}
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-lg text-gray-600">{subtitle}</p>
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mt-2">{categoryName}</span>
                  </div>

                  {/* 상영 정보 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">상영관:</span>
                      <span className="text-gray-900 font-semibold">
                        {cinemaName} {screenName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">일시:</span>
                      <span className="text-gray-900 font-semibold">
                        {screenDate} {screenTime}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">좌석:</span>
                      <span className="text-gray-900 font-semibold">{seatInfo}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">가격:</span>
                      <span className="text-gray-900 font-semibold text-xl text-red-600">{price?.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>

                {/* 하단 정보 */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>펀딩 ID: {fundingId}</p>
                  <p>생성일: {createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
