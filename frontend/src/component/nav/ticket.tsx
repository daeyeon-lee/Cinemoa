'use client';
import React from 'react';
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
  return (
    <div className="w-full max-w-sm mx-auto max-h-[100vh] overflow-hidden">
      {/* Jazz Love Fest 스타일 세로형 티켓 */}
      <div className="bg-BG-2 rounded-2xl overflow-hidden shadow-2xl relative border-2 border-stroke-4">
        {/* 상단 포스터 영역 - 더욱 길게 */}
        <div className="relative h-full overflow-hidden">
          <img src={posterUrl || ''} alt={title || ''} height={320} width={320} className="object-fill" />

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

          {/* 영화 제목 오버레이 */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h3 className="text-2xl font-bold drop-shadow-lg">{title}</h3>
            <p className="text-lg opacity-90">{subtitle}</p>
          </div>
        </div>

        {/* 메인 정보 영역 */}
        <div className="p-4">
          {/* 상영 정보 */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-600 font-medium">상영관:</span>
              <span className="text-gray-900 font-semibold">
                {cinemaName} {screenName}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-600 font-medium">일시:</span>
              <span className="text-gray-900 font-semibold">
                {screenDate} {screenTime}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-600 font-medium">좌석:</span>
              <span className="text-gray-900 font-semibold">{seatInfo}</span>
            </div>

            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-gray-600 font-medium">가격:</span>
              <span className="text-gray-900 font-semibold text-lg">{price?.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
