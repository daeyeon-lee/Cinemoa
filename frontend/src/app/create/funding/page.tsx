'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import FundingInfoTab from './component/FundingInfoTab';
import { fundinginfo } from '@/types/funding';
import { movieinfo } from '@/types/funding';
import { theaterinfo } from '@/types/funding';
import MovieInfoTab from './component/MovieInfoTab';
import TheaterInfoTab from './component/TheaterInfoTab';
import PaymentTab from './component/PaymentTab';

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
  const [fundingData, setFundingData] = useState<fundinginfo | null>(null);
  const [movieData, setMovieData] = useState<movieinfo | null>(null);
  const [theaterData, setTheaterData] = useState<theaterinfo | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // 펀딩 정보 데이터 처리 함수
  const handleFundingData = (data: fundinginfo) => {
    console.log('=== handleFundingData ===');
    console.log('받은 데이터:', data);
    setFundingData(data);
    setActiveTab('movie-info');
  };

  // 상영물 정보 데이터 처리 함수
  const handleMovieData = (data: movieinfo) => {
    console.log('=== handleMovieData ===');
    console.log('받은 데이터:', data);
    setMovieData(data);
    setActiveTab('theater-info');
  };

  // 상영관 정보 데이터 처리 함수
  const handleTheaterData = (data: theaterinfo) => {
    setTheaterData(data);
    setActiveTab('payment');
  };

  // 결제 정보 데이터 처리 함수
  const handlePaymentData = (data: any) => {
    setPaymentData(data);
  };

  // 이전 단계로 이동하는 함수들
  const handlePrevFunding = () => {
    // 펀딩 소개는 첫 번째 단계이므로 만들기 홈으로 이동
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
        return <TheaterInfoTab onNext={handleTheaterData} onPrev={handlePrevTheater} fundingData={fundingData || undefined} movieData={movieData || undefined} />;
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
          <Button variant={activeTab === 'funding-info' ? 'brand1' : 'tertiary'} size="md" className="flex-1 rounded-[25px] mx-1" disabled>
            펀딩 소개
          </Button>
          <Button variant={activeTab === 'movie-info' ? 'brand1' : 'tertiary'} size="md" className="flex-1 rounded-[25px] mx-1" disabled>
            상영물 정보
          </Button>
          <Button variant={activeTab === 'theater-info' ? 'brand1' : 'tertiary'} size="md" className="flex-1 rounded-[25px] mx-1" disabled>
            영화관 정보
          </Button>
          <Button variant={activeTab === 'payment' ? 'brand1' : 'tertiary'} size="md" className="flex-1 rounded-[25px] mx-1" disabled>
            결제
          </Button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="px-4 w-full overflow-hidden">{renderTabContent()}</div>
      </div>
    </div>
  );
}
