'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import FundingInfoTab, { FundingData } from './components/FundingInfoTab';
import MovieInfoTab from './components/MovieInfoTab';
import TheaterInfoTab from './components/TheaterInfoTab';
import PaymentTab from './components/PaymentTab';
import { createFunding } from '@/api/funding';
import { CreateFundingParams } from '@/types/funding';
import * as z from 'zod';

// MovieInfoTab에서 전달하는 데이터 타입
interface MovieData {
  selectedCategory: string;
  movieTitle: string;
  movieDescription: string;
  selectedImage: string;
  selectedMovieId: string;
}

export default function FundingPage() {
  const [activeTab, setActiveTab] = useState('funding-info');
  const [fundingData, setFundingData] = useState<FundingData | null>(null);
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [theaterData, setTheaterData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // 펀딩 소개 데이터 처리 함수
  const handleFundingData = (data: FundingData) => {
    setFundingData(data);
    console.log('=== 펀딩 소개 데이터 저장됨 ===');
    console.log('데이터:', data);
    console.log('================================');
    setActiveTab('movie-info');
  };

  // 영화 정보 데이터 처리 함수
  const handleMovieData = (data: MovieData) => {
    setMovieData(data);
    console.log('=== 영화 정보 데이터 저장됨 ===');
    console.log('데이터:', data);
    console.log('================================');
    setActiveTab('theater-info');
  };

  // 상영관 정보 데이터 처리 함수
  const handleTheaterData = (data: any) => {
    setTheaterData(data);
    console.log('=== 상영관 정보 데이터 저장됨 ===');
    console.log('데이터:', data);
    console.log('================================');
    setActiveTab('payment');
  };

  // 결제 정보 데이터 처리 함수
  const handlePaymentData = (data: any) => {
    setPaymentData(data);
    console.log('=== 결제 정보 데이터 저장됨 ===');
    console.log('데이터:', data);
    console.log('================================');
  };

  // 이전 단계로 이동하는 함수들
  const handlePrevFunding = () => {
    // 펀딩 소개는 첫 번째 단계이므로 펀딩 홈으로 이동
    window.location.href = '/create/';
  };

  const handlePrevMovie = () => {
    setActiveTab('funding-info');
  };

  const handlePrevTheater = () => {
    setActiveTab('movie-info');
  };

  const handlePrevPayment = () => {
    setActiveTab('theater-info');
  };

  // 탭 컴포넌트 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case 'funding-info':
        return <FundingInfoTab onNext={handleFundingData} onPrev={handlePrevFunding} />;
      case 'movie-info':
        return <MovieInfoTab onNext={handleMovieData} onPrev={handlePrevMovie} />;
      case 'theater-info':
        return <TheaterInfoTab onNext={handleTheaterData} onPrev={handlePrevTheater} />;
      case 'payment':
        return <PaymentTab onNext={handlePaymentData} onPrev={handlePrevPayment} />;
      default:
        return <FundingInfoTab onNext={handleFundingData} onPrev={handlePrevFunding} />;
    }
  };

  return (
    <div className="px-2 min-h-screen pt-4 sm:pt-12">
      <div className="flex flex-col gap-10  w-full">
        <Card className="flex flex-col gap-4 px-4 sm:px-6">
          <CardHeader className="max-sm:text-center">
            <CardTitle>펀딩 만들기</CardTitle>
            <CardDescription>원하는 영화의 상영회를 직접 제안해보세요</CardDescription>
          </CardHeader>
        </Card>

        {/* 네비게이션 탭 */}
        <div className="w-full flex px-4 py-2">
          <Button
            variant={activeTab === 'funding-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[25px] mx-1"
            disabled
          >
            펀딩 소개
          </Button>
          <Button
            variant={activeTab === 'movie-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[25px] mx-1"
            disabled
          >
            상영물 정보
          </Button>
          <Button
            variant={activeTab === 'theater-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[25px] mx-1"
            disabled
          >
            영화관 정보
          </Button>
          <Button
            variant={activeTab === 'payment' ? 'brand1' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[25px] mx-1"
            disabled
          >
            결제
          </Button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="px-4 w-full overflow-hidden">{renderTabContent()}</div>
      </div>
    </div>
  );
}
