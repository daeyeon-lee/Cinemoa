'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Media } from '@/components/cards/primitives/Media';

import { getParticipatedFunding, getSuccessFunding } from '@/api/mypage';
import { SuccessFunding, SuccessFundingResponse } from '@/types/mypage';
import { useAuthStore } from '@/stores/authStore';

interface TicketProps {
  onClose?: () => void;
}

export default function Ticket({ onClose }: TicketProps) {
  const { user } = useAuthStore();
  const userId = user?.userId;
  const [successFunding, setSuccessFunding] = useState<SuccessFunding[]>([]);
  const [loading, setLoading] = useState(true);

  // 성공한 상영회 데이터 가져오기
  useEffect(() => {
    const fetchSuccessTickets = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getSuccessFunding(userId, 3); // 성공한 상영회만
        setSuccessFunding(response.data.content);
        console.log('성공한 상영회 데이터', response.data.content);
      } catch (error) {
        console.error('성공한 상영회 데이터 가져오기 실패:', error);
        setSuccessFunding([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessTickets();
  }, [userId]);

  // API에서 가져온 성공한 상영회 데이터를 그대로 사용
  const ticketList = successFunding;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextTicket = () => {
    if (currentIndex < ticketList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false); // 새 티켓으로 넘어갈 때 앞면으로 리셋
    }
  };

  const handlePrevTicket = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false); // 이전 티켓으로 넘어갈 때 앞면으로 리셋
    }
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < ticketList.length - 1) {
      handleNextTicket();
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevTicket();
    }
  };

  // 휠 이벤트를 수동으로 등록하여 passive 문제 해결
  useEffect(() => {
    const container = document.getElementById('ticket-container');
    if (!container) return;

    const handleWheelManual = (e: WheelEvent) => {
      e.preventDefault();

      if (e.deltaY > 0 && currentIndex < ticketList.length - 1) {
        // 아래로 스크롤 = 다음 티켓
        handleNextTicket();
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // 위로 스크롤 = 이전 티켓
        handlePrevTicket();
      }
    };

    // passive: false로 설정하여 preventDefault 가능하게 함
    container.addEventListener('wheel', handleWheelManual, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelManual);
    };
  }, [currentIndex, ticketList.length, handleNextTicket, handlePrevTicket]);

  const ticket = ticketList[currentIndex];

  // 로딩 상태
  if (loading) {
    return (
      <div className="w-full max-w-sm mx-auto h-[650px] max-lg:h-[350px] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-spin border-t-purple-500"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-pink-500/20 rounded-full animate-spin border-t-pink-500"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            ></div>
          </div>
          <p className="text-sm text-white/70 mt-6 font-medium">티켓을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 티켓이 없는 경우
  if (ticketList.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto h-[650px] max-lg:h-[550px] flex items-center justify-center">
        <div className="text-center text-primary">
          <h3 className="h4-b text-primary mb-3">상영예정인 상영회가 없습니다</h3>
          <p className="p2 text-secondary leading-relaxed">
            상영예정인 상영회가 있으면
            <br />
            여기에 스마트 티켓이 표시됩니다
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4 px-4"
            onClick={() => {
              onClose?.();
            }}
          >
            {' '}
            확인{' '}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="ticket-container" className="w-full max-w-sm mx-auto max-h-[100vh] overflow-hidden py-8" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* 스택형 카드 컨테이너 */}
      <div className="relative w-full h-[600px] max-lg:h-[500px]" style={{ perspective: '1200px' }}>
        {/* 배경 티켓들 (스택 효과) - 항상 숨김 */}
        {false &&
          ticketList.map((ticket, index) => {
            if (index <= currentIndex) return null; // 현재 티켓과 이전 티켓들은 보이지 않음

            const stackIndex = index - currentIndex - 1;
            const zIndex = ticketList.length - index;
            const translateY = stackIndex * 12;
            const scale = 1 - stackIndex * 0.08;
            const opacity = 1 - stackIndex * 0.25;

            return (
              <div
                key={index}
                className="absolute inset-0 w-full h-full"
                style={{
                  zIndex,
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  opacity: Math.max(opacity, 0.2),
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div className="bg-gradient-to-br from-slate-800 via-purple-800 to-slate-700 rounded-3xl overflow-hidden shadow-2xl relative border border-purple-500/30 h-full">
                  <div className="relative h-full overflow-hidden">
                    {ticket.funding.ticketBanner ? (
                      <img src={ticket.funding.ticketBanner} alt={ticket.funding.title} className="w-full h-full object-cover" />
                    ) : (
                      <img src={ticket.funding.bannerUrl || ''} alt={ticket.funding.title || ''} className="w-full h-full object-cover" />
                    )}
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* 현재 활성 티켓 (3D 플립 효과) */}
        <div
          className="absolute inset-0 w-full h-full cursor-pointer"
          style={{
            zIndex: ticketList.length + 1,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
          onClick={handleFlip}
        >
          {/* 앞면 - 포스터 */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              borderRadius: '1.5rem',
              overflow: 'hidden',
            }}
          >
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 h-full relative ">
              {/* 네온 글로우 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 rounded-3xl"></div>
              <div className="h-full flex flex-col p-6 gap-3 max-lg:p-4 max-lg:gap-4 relative z-10">
                {/* 브랜딩 헤더 */}
                <div className="flex items-center justify-between">
                  <img src="/cinemoa_logo_long.png" alt="Cinemoa" className="w-31 h-8 object-cover" />
                </div>

                {/* 포스터 이미지 */}
                <div className="h-[520px] max-lg:h-[400px] rounded-2xl overflow-hidden relative group">
                  {/* 동영상 없으면 이미지로 들어옴 */}
                  {ticket.funding.ticketBanner ? (
                    <video src={ticket.funding.ticketBanner} className="w-full h-full object-cover " />
                  ) : (
                    <img src={ticket.funding.bannerUrl || ''} alt={ticket.funding.title || ''} className="w-full h-full object-cover" />
                  )}

                  {/* 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

                  {/* 영화 제목 오버레이 */}
                  <div className="absolute bottom-6 left-4 right-4">
                    <h3 className="text-primary h3-b mb-1 drop-shadow-lg">{ticket.funding.videoName}</h3>
                    <p className="text-secondary p2-b">{ticket.cinema.cinemaName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 뒷면 - 영화 정보 */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: '1.5rem',
              overflow: 'hidden',
            }}
          >
            <div className="h-full rounded-3xl w-full shadow-2xl border border-purple-500/20 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
              {/* 네온 글로우 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 rounded-3xl"></div>

              {/* 배경 패턴 */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-pink-500 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              <div className="relative p-6 pb-16 flex flex-col text-white overflow-hidden z-10 h-full">
                {/* 티켓 헤더 */}
                <div className="text-center mb-6 flex-shrink-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
                    <span className="text-white/90 h6-b">SMART TICKET</span>
                  </div>
                  <p className="p1 text-secondary"> {ticket.funding.title}</p>
                  <h3 className="h3-b text-primary">{ticket.funding.videoName}</h3>
                </div>

                {/* 티켓 정보 카드들 */}
                <div className="flex-shrink-0">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="space-y-3">
                      {/* 상영관 정보 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-white/60 h6-b">상영관</p>
                            <p className="text-white h4-b">{ticket.cinema.cinemaName}</p>
                          </div>
                        </div>
                      </div>

                      {/* 상영일시 정보 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-white/60 h6-b">상영일시</p>
                            <p className="text-white h4-b">{ticket.funding.screenDate}</p>
                          </div>
                        </div>
                      </div>

                      {/* 금액 정보 */}
                      <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-white/60 h4-b">금액</p>
                            <p className="text-white h4-b">{ticket.funding.price?.toLocaleString()}원</p>
                          </div>
                        </div>
                      </div>

                      {/* 구분선 */}
                      <div className="border-t border-stroke-1 my-3 pt-3"></div>
                      {/* 바코드 영역 */}
                      <div>
                        <img src="/tickets/barcode.png" alt="바코드 " className="w-full h-full object-cover rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 점 인디케이터 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-3 z-50">
        {ticketList.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setIsFlipped(false); // 새 티켓으로 이동할 때 앞면으로 리셋
            }}
            className={`relative transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50'
                : 'w-3 h-3 bg-white/30 hover:bg-white/50 rounded-full hover:scale-110'
            }`}
          >
            {index === currentIndex && <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>}
          </button>
        ))}
      </div>
    </div>
  );
}
