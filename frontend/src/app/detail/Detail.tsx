'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Media } from '@/components/cards/primitives/Media';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CalenderIcon from '@/component/icon/calenderIcon';
import TimeIcon from '@/component/icon/timeIcon';
import LocationIcon from '@/component/icon/locationIcon';
import KakaoMap from '@/component/maps/KakaoMap';
import { CineDetailCard } from '@/components/cards/CineDetailCard';

// 더미데이터 타입
type FundingDetailData = {
  type: 'funding';
  funding: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    content: string;
    state: string;
    progressRate: number;
    fundingEndsOn: string;
    price: number;
  };
  proposer: {
    proposerId: number;
    creatorNickname: string;
  };
  screening: {
    videoName: string;
    screeningTitle: string;
    screenStartsOn: number;
    screenEndsOn: number;
  };
  stat: {
    maxPeople: number;
    participantCount: number;
    viewCount: number;
    likeCount: number;
    isLiked: boolean;
  };
  metadata: {
    categoryId: number;
    recommendationScore: number;
  };
  screen: {
    screenId: number;
    screenName: string;
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
  };
};

type VoteDetailData = {
  type: 'vote';
  vote: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    content: string;
    state: string;
    fundingStartsOn: string;
    fundingEndsOn: string;
  };
  proposer: {
    proposerId: number;
    creatorNickname: string;
  };
  screening: {
    videoName: string;
    screeningTitle: string;
    screenStartsOn: string;
    screenEndsOn: string;
  };
  participation: {
    viewCount: number;
    likeCount: number;
    isLike: boolean;
  };
  metadata: {
    categoryId: number;
    recommendationScore: number;
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
    lat?: number;
    lng?: number;
  };
};

// 펀딩 더미데이터
const sampleDetailFundingData: FundingDetailData = {
  type: 'funding',
  funding: {
    fundingId: 1,
    title: '타이타닉',
    bannerUrl: 'images/image.png',
    content: '명작 <타이타닉>을 대형 스크린에서 함께 봅시다!',
    state: 'ON_PROGRESS',
    progressRate: 80,
    fundingEndsOn: '2025-12-15T23:59:59+09:00',
    price: 10000,
  },
  proposer: {
    proposerId: 2,
    creatorNickname: '당근123',
  },
  screening: {
    videoName: '타이타닉',
    screeningTitle: '명작 <타이타닉> 봅시다!',
    screenStartsOn: 19,
    screenEndsOn: 21,
  },
  stat: {
    maxPeople: 100,
    participantCount: 80,
    viewCount: 144,
    likeCount: 34,
    isLiked: true,
  },
  metadata: {
    categoryId: 1,
    recommendationScore: 13,
  },
  screen: {
    screenId: 1,
    screenName: '범계 롯데시네마 7관',
  },
  cinema: {
    cinemaId: 1,
    cinemaName: '안양(범계) 롯데시네마',
    city: '안양시',
    district: '동안구',
  },
};

// 투표 더미데이터
const sampleDetailVoteData: VoteDetailData = {
  type: 'vote',
  vote: {
    fundingId: 1,
    title: '타이타닉',
    bannerUrl: 'images/image.png',
    content: '명작 <타이타닉>을 대형 스크린에서 함께 봅시다!',
    state: 'ON_PROGRESS',
    fundingStartsOn: '2025-10-01T00:00:00+09:00',
    fundingEndsOn: '2025-12-15T23:59:59+09:00',
  },
  proposer: {
    proposerId: 2,
    creatorNickname: '당근123',
  },
  screening: {
    videoName: '타이타닉',
    screeningTitle: '명작 <타이타닉> 봅시다!',
    screenStartsOn: '2025-10-10T19:00:00+09:00',
    screenEndsOn: '2025-10-10T21:00:00+09:00',
  },
  participation: {
    viewCount: 144,
    likeCount: 34,
    isLike: true,
  },
  metadata: {
    categoryId: 1,
    recommendationScore: 13,
  },
  cinema: {
    cinemaId: 1,
    cinemaName: '안양(범계) 롯데시네마',
    city: '안양시',
    district: '동안구',
    lat: 37.4563,
    lng: 126.9723,
  },
};

export default function Detail() {
  const [activeButton, setActiveButton] = useState('funding-info'); // 기본값 : 펀딩 소개 활성화

  // 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(sampleDetailFundingData.stat.isLiked);
  const [likeCount, setLikeCount] = useState(sampleDetailFundingData.stat.likeCount);

  // 공유 다이얼로그 상태 관리
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleButtonClick = (buttonId: string, targetId: string) => {
    // 버튼 클릭 시 해당 버튼 활성화
    setActiveButton(buttonId);
    // 해당 버튼 클릭 시 해당 컨텐츠 이동
    document
      .getElementById(targetId as 'funding-info' | 'movie-info' | 'theater-info' | 'refund-info')
      ?.scrollIntoView({ behavior: 'smooth' }); // 부드럽게 이동
  };

  const handleLikeClick = () => {
    if (isLiked) {
      const newCount = likeCount - 1;
      setLikeCount(newCount);
      setIsLiked(false);
      console.log('좋아요 취소, 새로운 카운트:', newCount);
    } else {
      const newCount = likeCount + 1;
      setLikeCount(newCount);
      setIsLiked(true);
      console.log('좋아요 추가, 새로운 카운트:', newCount);
    }
  };

  const handleShareClick = () => {
    setShareDialogOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      // 현재 페이지 URL 복사
      await navigator.clipboard.writeText(window.location.href);
      console.log('링크 복사', window.location.href);
      showAlert('링크를 복사했습니다');
      setShareDialogOpen(false); // 다이얼로그 닫기
    } catch (error) {
      console.error('링크 복사 실패:', error);
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), 2000); // 2초 후 자동 사라짐
  };

  return (
    <section>
      {/* 펀딩 카드 */}
      <CineDetailCard
        data={sampleDetailFundingData}
        loadingState="ready"
        isLiked={isLiked}
        likeCount={likeCount}
        onPrimaryAction={handleLikeClick}
      />
      {/* 투표 카드 */}
      <CineDetailCard
        data={sampleDetailVoteData}
        loadingState="ready"
        isLiked={isLiked}
        likeCount={likeCount}
        onPrimaryAction={handleLikeClick}
        onSecondaryAction={handleShareClick}
      />
      {/* navbar : 펀딩 소개, 상영물 소개, 영화관 정보, 환불 및 위약 정보 */}
      <div className="flex flex-col gap-10 mt-10">
        <div className="grid grid-cols-2 sm:flex sm:flex-nowrap w-full px-4 py-2 gap-4 sm:overflow-x-auto">
          <Button
            variant={activeButton === 'funding-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="rounded-[25px]"
            onClick={() => handleButtonClick('funding-info', 'funding-info')}
          >
            펀딩 소개
          </Button>
          <Button
            variant={activeButton === 'movie-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="rounded-[25px]"
            onClick={() => handleButtonClick('movie-info', 'movie-info')}
          >
            상영물 정보
          </Button>
          <Button
            variant={activeButton === 'theater-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="rounded-[25px]"
            onClick={() => handleButtonClick('theater-info', 'theater-info')}
          >
            영화관 정보
          </Button>
          <Button
            variant={activeButton === 'refund-info' ? 'brand1' : 'tertiary'}
            size="md"
            className="rounded-[25px]"
            onClick={() => handleButtonClick('refund-info', 'refund-info')}
          >
            환불 및 위약 정보
          </Button>
        </div>
        <Card id="funding-info" className="flex flex-col gap-4 px-4" variant="detail">
          {/* 펀딩 상세 소개 */}
          <CardHeader>
            <CardTitle>펀딩 소개</CardTitle>
          </CardHeader>
          <CardContent>
            같이 영화 보실 분들 구합니다! 이 영화 꼭 보고 싶었는데 상영관이 없어서 아쉬웠어요. 저처럼 보고 싶으셨던 분들
            함께 모여서 대관해서 봐요! 펀딩 성공해서 꼭 같이 볼 수 있었으면 좋겠습니다.
          </CardContent>
        </Card>
        <Separator />
        <div id="movie-info" className="flex flex-col lg:flex-row w-full gap-4">
          <Card className="flex flex-col gap-4 w-full lg:w-1/3 min-h-[400px] px-4">
            {/* 상영물 소개 */}
            <CardHeader>
              <CardTitle>상영물 정보</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              {/* 상영물 이미지 */}
              <div className="w-full">
                <Media src="/images/image.png" alt="상영물 정보" aspect="4/3" height={200} />
              </div>
              {/* 상영물 정보 */}
              <div className="w-full flex flex-col gap-2 mt-3">
                <h6 className="h6-b text-primary">케이팝 데몬 헌터스(상영물 제목)</h6>
                <h6 className="p2 text-tertiary">
                  케이팝 슈퍼스타 루미, 미라, 조이, 그리고 제니. 화려한 무대 뒤, 그들은 사실 악마를 사냥하는
                  데몬헌터스다! 인간 세계를 위협하는 악마 군단에 맞서 싸우는 네 소녀의 화끈한 액션 판타지!(상영물 설명)
                </h6>
              </div>
              {/* 빈 공간을 늘리는 div */}
              <div className="flex-1"></div>
            </CardContent>
          </Card>
          <Card id="theater-info" className="flex flex-col gap-4 w-full lg:w-2/3 min-h-[400px] px-4">
            {/* 영화관 정보 */}
            <CardHeader>
              <CardTitle>영화관 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 mb-4">
                <p className="p1-b text-primary">CGV 강남 (영화관 정보)</p>
                <p className="p1-b text-primary">2관 | Dolby Atmos</p>
              </div>
              <Separator />
              {/* 상영일 정보 */}
              <div className="flex flex-col gap-4 w-full mt-4">
                {/* 상영 정보 */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <CalenderIcon />
                    <div>
                      <p className="p2 text-tertiary">상영일</p>
                      <p className="p1 text-primary">2025년 10월 10일 (금)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <TimeIcon />
                    <div>
                      <p className="p2 text-tertiary">관람 시간</p>
                      <p className="p1 text-primary">14:00 ~ 18:00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <LocationIcon />
                    <div>
                      <p className="p2 text-tertiary">영화관 주소</p>
                      <p className="p1 text-primary">서울특별시 강남구 테헤란로 152</p>
                    </div>
                  </div>
                </div>
                {/* 카카오맵 */}
                <div className="rounded-[6px] overflow-hidden">
                  <KakaoMap width="100%" height="300px" location="CGV 강남" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card id="refund-info" className="flex flex-col gap-4 px-4" variant="detail">
          {/* 환불 및 위약 정보 */}
          <CardHeader>
            <CardTitle>환불 및 위약 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li>- 펀딩 마감 후에는 취소 및 환불이 불가합니다.</li>
              <li>- 결제 환불은 펀딩 마감일 7일 전까지만 가능합니다.</li>
              <li>- 환불 불가 기간에 환불을 신청하실 경우, 환불이 불가하다는 안내를 드립니다.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      {/* 공유 다이얼로그 */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent variant="share" className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-center">링크 공유</DialogTitle>
            <DialogDescription className="text-center text-tertiary">
              현재 페이지의 링크를 복사하여 공유할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="h5 text-secondary">현재 페이지 링크</label>
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1 h-10 p2 text-secondary bg-BG-1 border-stroke-3 focus:border-primary-500 transition-colors"
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  type="text"
                  readOnly
                />
                <Button variant="primary" size="md" className="h-10 px-4 whitespace-nowrap" onClick={handleCopyLink}>
                  복사
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 커스텀 알림창 */}
      {alertMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
          {/* 어두운 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/80"></div>

          {/* 알림창 컨텐츠 */}
          <div className="relative bg-BG-2 text-primary px-8 py-6 rounded-2xl shadow-2xl max-w-md w-max text-center animate-in zoom-in-95 duration-200">
            <p className="h6-b">{alertMessage}</p>
          </div>
        </div>
      )}
    </section>
  );
}
