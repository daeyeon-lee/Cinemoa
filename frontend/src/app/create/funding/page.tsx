'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import FundingInfoTab from './components/FundingInfoTab';
import MovieInfoTab from './components/MovieInfoTab';
import TheaterInfoTab from './components/TheaterInfoTab';
import RefundInfoTab from './components/PaymentTab';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string().min(1, '펀딩 제목을 입력해주세요'),
  summary: z.string().min(1, '한 줄 소개를 입력해주세요'),
  description: z.string().min(1, '상세 소개를 입력해주세요'),
});

export default function FundingPage() {
  const [activeTab, setActiveTab] = useState('funding-info');
  const [fundingData, setFundingData] = useState<z.infer<typeof formSchema> | null>(null);

  // 탭 변경 함수
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  // 펀딩 소개 데이터 처리 함수
  const handleFundingData = (data: z.infer<typeof formSchema>) => {
    setFundingData(data);
    console.log('펀딩 소개 데이터 저장됨:', data);
    // 다음 단계로 이동하거나 다른 처리
  };

  // 탭 컴포넌트 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case 'funding-info':
        return <FundingInfoTab onNext={handleFundingData} />;
      case 'movie-info':
        return <MovieInfoTab />;
      case 'theater-info':
        return <TheaterInfoTab />;
      case 'payment':
        return <RefundInfoTab />;
      default:
        return <FundingInfoTab onNext={handleFundingData} />;
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
            onClick={() => handleTabChange('funding-info')}
          >
            펀딩 소개
          </Button>
          <Button
            variant={activeTab === 'movie-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[25px] mx-1"
            onClick={() => handleTabChange('movie-info')}
          >
            상영물 정보
          </Button>
          <Button
            variant={activeTab === 'theater-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[25px] mx-1"
            onClick={() => handleTabChange('theater-info')}
          >
            영화관 정보
          </Button>
          <Button
            variant={activeTab === 'payment' ? 'brand1' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[25px] mx-1"
            onClick={() => handleTabChange('payment')}
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
