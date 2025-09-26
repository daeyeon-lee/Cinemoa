'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FundingInfoTab from './component/FundingInfoTab';
import { fundinginfo } from '@/types/funding';
import { movieinfo } from '@/types/funding';
import MovieInfoTab from './component/MovieInfoTab';
import TheaterInfoTab from './component/TheaterInfoTab';
import PaymentTab from './component/PaymentTab';
import { getFundingDetail } from '@/api/fundingDetail';
import type { DetailData } from '@/types/fundingDetail';

// MovieInfoTab에서 전달하는 데이터 타입
interface MovieData {
  selectedCategory: string;
  movieTitle: string;
  movieDescription: string;
  selectedImage: string;
  selectedMovieId: string;
}

export default function FundingPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('funding-info');
  const [fundingData, setFundingData] = useState<fundinginfo | null>(null);
  const [movieData, setMovieData] = useState<movieinfo | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [fundingId, setFundingId] = useState<number | null>(null);
  const [perPersonAmount, setPerPersonAmount] = useState<number | null>(null);
  const [existingFundingData, setExistingFundingData] = useState<DetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // URL 파라미터에서 fundingId와 userId 가져오기
  const urlFundingId = searchParams.get('fundingId');
  const urlUserId = searchParams.get('userId');

  // 기존 투표 정보 조회
  useEffect(() => {
    const fetchExistingFunding = async () => {
      if (urlFundingId && urlUserId) {
        setIsLoading(true);
        try {
          const response = await getFundingDetail(urlFundingId, urlUserId);
          if (response.data) {
            setExistingFundingData(response.data);
            console.log('기존 투표 정보 조회 성공:', response.data);
            
            // 기존 정보를 폼 데이터로 변환
            if (response.data.type === 'VOTE') {
              const voteData = response.data;
              
              // 펀딩 정보 설정
              const fundingInfo: fundinginfo = {
                title: voteData.funding.title,
                content: voteData.funding.content,
              };
              setFundingData(fundingInfo);

              // 영화 정보 설정
              const movieInfo: movieinfo = {
                categoryId: voteData.category.categoryId,
                videoName: voteData.funding.title,
                videoContent: voteData.funding.content,
                posterUrl: voteData.funding.bannerUrl || '',
              };
              setMovieData(movieInfo);
            }
          }
        } catch (error) {
          console.error('기존 투표 정보 조회 실패:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExistingFunding();
  }, [urlFundingId, urlUserId]);

  // 펀딩 정보 데이터 처리 함수
  const handleFundingData = (data: fundinginfo) => {
    // console.log('=== handleFundingData ===');
    // console.log('받은 데이터:', data);
    setFundingData(data);
    setActiveTab('movie-info');
  };

  // 상영물 정보 가지고 영화관 정보로 이동
  const handleMovieData = (data: movieinfo) => {
    // console.log('=== handleMovieData ===');
    // console.log('받은 데이터:', data);
    setMovieData(data);
    setActiveTab('theater-info');
  };

  // fundingId와 결제 금액 가지고 결제 정보로 이동
  const handleTheaterData = (data: { fundingId: number; amount: number }) => {
    setFundingId(data.fundingId);
    setPerPersonAmount(data.amount);
    setActiveTab('payment');
  };

  // 결제 정보 데이터 처리 함수 (fundingId 받음)
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
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">기존 정보를 불러오는 중...</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'funding-info':
        return <FundingInfoTab onNext={handleFundingData} onPrev={handlePrevFunding} existingData={fundingData} />;
      case 'movie-info':
        return <MovieInfoTab onNext={handleMovieData} onPrev={handlePrevMovie} existingData={movieData} />;
      case 'theater-info':
        return <TheaterInfoTab onNext={handleTheaterData} onPrev={handlePrevTheater} fundingData={fundingData || undefined} movieData={movieData || undefined} />;
      case 'payment':
        return <PaymentTab onNext={handlePaymentData} onPrev={handlePrevPayment} fundingId={fundingId} amount={perPersonAmount || undefined} />;
      default:
        return <FundingInfoTab onNext={handleFundingData} onPrev={handlePrevFunding} existingData={fundingData} />;
    }
  };

  return (
    <div className="lg:px-5 px-3 min-h-screen pt-4 sm:pt-12">
      <div className="flex flex-col gap-10  w-full">
        <Card className="flex flex-col gap-4 px-4 sm:px-6">
          <CardHeader className="max-sm:text-center">
            <CardTitle>상영회 만들기</CardTitle>
            <CardDescription>원하는 영화의 상영회를 직접 제안해보세요</CardDescription>
          </CardHeader>
        </Card>

        {/* 네비게이션 탭 */}
        <div className="w-full flex px-1 py-1 sm:px-2 sm:py-2 md:px-3 md:py-2 lg:px-4 lg:py-2 gap-1.5">
          {[
            { key: 'funding-info', label: '상영회 소개' },
            { key: 'movie-info', label: '상영물 정보' },
            { key: 'theater-info', label: '영화관 정보' },
            { key: 'payment', label: '결제' }
          ].map(({ key, label }) => (
            <div
              key={key}
              className={`flex-1 rounded-full mx-0.5 sm:mx-0.5 md:mx-0.5 lg:mx-1 h-10 px-1 sm:px-2 md:px-3 lg:px-4 text-h6-b max-sm:text-p2-b max-sm:h-8 flex items-center justify-center text-primary select-none ${
                activeTab === key ? 'bg-Brand1-Primary' : 'bg-BG-3'
              }`}
            >
              <span className="md:inline">{label}</span>
            </div>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="px-4 w-full overflow-hidden">{renderTabContent()}</div>
      </div>
    </div>
  );
}
