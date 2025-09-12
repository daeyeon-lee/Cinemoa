import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Media } from '@/components/cards/primitives/Media';
import { Separator } from '@/components/ui/separator';
import CalenderIcon from '@/component/icon/calenderIcon';
import TimeIcon from '@/component/icon/timeIcon';
import LocationIcon from '@/component/icon/locationIcon';
import KakaoMap from '@/component/KakaoMap';
import { CineDetailCard } from '@/components/cards/CineDetailCard';

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

export default function Detail() {
  return (
    // 이동 시키는 navbar
    <section>
      <CineDetailCard data={sampleDetailFundingData} loadingState="ready" />
      <div className="flex flex-col gap-10 mt-10">
        <div className="flex w-max px-4 py-2 gap-4">
          <Button variant="brand1" size="md" className="w-full rounded-[25px]">
            펀딩 소개
          </Button>
          <Button variant="tertiary" size="md" className="w-full rounded-[25px]">
            상영물 소개
          </Button>
          <Button variant="tertiary" size="md" className="w-full rounded-[25px]">
            영화관 정보
          </Button>
          <Button variant="tertiary" size="md" className="w-full rounded-[25px]">
            환불 및 위약 정보
          </Button>
        </div>
        <Card className="flex flex-col gap-4" variant="detail">
          {/* 펀딩 상세 소개 */}
          <CardHeader>
            <CardTitle>펀딩 소개</CardTitle>
          </CardHeader>
          <CardContent>
            같이 영화 보실 분들 구합니다! 이 영화 꼭 보고 싶었는데 상영관이 없어서 아쉬웠어요. 저처럼 보고 싶으셨던 분들
            함께 모여서 대관해서 봐요! 펀딩 성공해서 꼭 같이 볼 수 있었으면 좋겠습니다.
          </CardContent>
        </Card>
        <Card className="flex flex-col gap-4" variant="detail">
          {/* 상영물 소개 */}
          <CardHeader>
            <CardTitle>상영물 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 상영물 이미지 */}
            <div className="flex gap-4">
              <div className="w-20">
                <Media src="/images/image.png" alt="상영물 정보" aspect="auto" height={112} />
              </div>
              {/* 상영물 정보 */}
              <div className="w-full flex flex-col gap-2">
                <h6 className="h6-b text-primary">케이팝 데몬 헌터스(상영물 제목)</h6>
                <h6 className="p2 text-tertiary">
                  케이팝 슈퍼스타 루미, 미라, 조이, 그리고 제니. 화려한 무대 뒤, 그들은 사실 악마를 사냥하는
                  데몬헌터스다! 인간 세계를 위협하는 악마 군단에 맞서 싸우는 네 소녀의 화끈한 액션 판타지!(상영물 설명)
                </h6>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col gap-4" variant="detail">
          {/* 영화관 정보 */}
          <CardHeader>
            <CardTitle>영화관 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <p className="p1-b text-primary">CGV 강남 (영화관 정보)</p>
              <p className="p1-b text-primary">2관 | Dolby Atmos</p>
            </div>
            <Separator />
            {/* 상영일 정보 */}
            <div className="flex gap-6 justify-between w-full mt-4">
              {/* 왼쪽: 상영 정보 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <CalenderIcon />
                    <div>
                      <p className="p2 text-tertiary">상영일</p>
                      <p className="p1 text-primary">2025년 10월 10일 (금)</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <TimeIcon />
                    <div>
                      <p className="p2 text-tertiary">관람 시간</p>
                      <p className="p1 text-primary">14:00 ~ 18:00</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <LocationIcon />
                    <div>
                      <p className="p2 text-tertiary">영화관 주소</p>
                      <p className="p1 text-primary">서울특별시 강남구 테헤란로 152</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* 오른쪽: 카카오맵 */}
              <div className="rounded-2xl overflow-hidden ">
                <KakaoMap width="647px" height="300px" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col gap-4">
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
    </section>
  );
}
