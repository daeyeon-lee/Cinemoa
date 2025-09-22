'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import VoteFundingInfoTab from './component/VoteFundingInfoTab';
import { VoteFundinginfo } from '@/types/vote';
import { VoteMovieinfo } from '@/types/vote';
import { VoteTheaterinfo } from '@/types/vote';
import VoteMovieInfoTab from './component/VoteMovieInfoTab';
import VoteTheaterInfoTab from './component/VoteTheaterInfoTab';
import HorizontalScroller from '@/components/containers/HorizontalScroller';

// MovieInfoTab에서 전달하는 데이터 타입
interface MovieData {
  selectedCategory: string;
  movieTitle: string;
  movieDescription: string;
  selectedImage: string;
  selectedMovieId: string;
}

export default function VotePage() {
  const [voteActiveTab, setVoteActiveTab] = useState('vote-funding-info');
  const [fundingData, setVoteFundingData] = useState<VoteFundinginfo | null>(null);
  const [movieData, setVoteMovieData] = useState<VoteMovieinfo | null>(null);
  const [theaterData, setVoteTheaterData] = useState<VoteTheaterinfo | null>(null);

  // 펀딩 정보 데이터 처리 함수
  const handleFundingData = (data: VoteFundinginfo) => {
    console.log('=== handleFundingData ===');
    console.log('받은 데이터:', data);
    setVoteFundingData(data);
    setVoteActiveTab('vote-movie-info');
  };

  // 상영물 정보 데이터 처리 함수
  const handleMovieData = (data: VoteMovieinfo) => {
    console.log('=== handleMovieData ===');
    console.log('받은 데이터:', data);
    setVoteMovieData(data);
    setVoteActiveTab('vote-theater-info');
  };

  // 상영관 정보 데이터 처리 함수
  const handleTheaterData = (data: VoteTheaterinfo) => {
    setVoteTheaterData(data);
    setVoteActiveTab('vote-payment');
  };

  // 이전 단계로 이동하는 함수들
  const handlePrevFunding = () => {
    // 펀딩 소개는 첫 번째 단계이므로 만들기 홈으로 이동
    window.location.href = '/create/';
  };

  const handlePrevVoteMovie = () => {
    setVoteActiveTab('vote-funding-info');
  };

  const handlePrevVoteTheater = () => {
    setVoteActiveTab('vote-movie-info');
  };

  // 탭 컴포넌트 렌더링 함수

  const renderTabContent = () => {
    switch (voteActiveTab) {
      case 'vote-funding-info':
        return <VoteFundingInfoTab onNext={handleFundingData} onPrev={handlePrevFunding} />;
      case 'vote-movie-info':
        return <VoteMovieInfoTab onNext={handleMovieData} onPrev={handlePrevVoteMovie} />;
      case 'vote-theater-info':
        return <VoteTheaterInfoTab onNext={handleTheaterData} onPrev={handlePrevVoteTheater} fundingData={fundingData || undefined} movieData={movieData || undefined} />;
      default:
        return <VoteFundingInfoTab onNext={handleFundingData} onPrev={handlePrevFunding} />;
    }
  };

  return (
    <div className="lg:px-5 px-3 min-h-screen pt-4 sm:pt-12">
      <div className="flex flex-col gap-10  w-full">
        <Card className="flex flex-col gap-4 px-4 sm:px-6">
          <CardHeader className="max-sm:text-center">
            <CardTitle>수요조사 만들기</CardTitle>
            <CardDescription>원하는 영화의 수요조사를 만들어 보세요</CardDescription>
          </CardHeader>
        </Card>

        {/* 네비게이션 탭 */}
        <div className="w-full flex px-1 py-1 sm:px-2 sm:py-2 md:px-3 md:py-2 lg:px-4 lg:py-2">
          <Button
            variant={voteActiveTab === 'vote-funding-info' ? 'brand2' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[20px] mx-0.5 sm:mx-0.5 md:mx-0.5 lg:mx-1 h-10 px-1 sm:px-2 md:px-3 lg:px-4 text-sm max-sm:text-xs max-sm:h-8"
            disabled
          >
            <span className="md:inline">수요조사 소개</span>
          </Button>
          <Button
            variant={voteActiveTab === 'vote-movie-info' ? 'brand2' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[20px] mx-0.5 sm:mx-0.5 md:mx-0.5 lg:mx-1 h-10 px-1 sm:px-2 md:px-3 lg:px-4 text-sm max-sm:text-xs max-sm:h-8"
            disabled
          >
            <span className="md:inline">상영물 정보</span>
          </Button>
          <Button
            variant={voteActiveTab === 'vote-theater-info' ? 'brand2' : 'tertiary'}
            size="md"
            className="flex-1 rounded-[20px] mx-0.5 sm:mx-0.5 md:mx-0.5 lg:mx-1 h-10 px-1 sm:px-2 md:px-3 lg:px-4 text-sm max-sm:text-xs max-sm:h-8"
            disabled
          >
            <span className="md:inline">영화관 정보</span>
          </Button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="px-4 w-full overflow-hidden">{renderTabContent()}</div>
      </div>
    </div>
  );
}
