'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import type { CardItem } from '@/types/mypage';
import type { ApiSearchItem } from '@/types/searchApi';
import { getUserInfo, getFundingProposals, getParticipatedFunding, getLikedFunding } from '@/api/mypage';
import type { UserInfo, FundingProposal, ParticipatedFunding, LikedFunding } from '@/types/mypage';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import CardManagement from '@/app/(main)/mypage/component/CardManagement';
import RefundAccountModal from '@/app/(main)/mypage/component/RefundAccountModal';
import EditProfileModal from '@/app/(main)/mypage/component/EditProfileModal';

// 아바타 컴포넌트: CSS background-image로 이미지를 렌더링
function Avatar({ src, size = 80 }: { src?: string; size?: number }) {
  // 기본 이미지(플레이스홀더) 설정
  const url = src || 'https://placehold.co/72x72';

  return (
    <div
      // 동그란 아바타 프레임 + 잘림 처리
      className="rounded-full overflow-hidden flex-shrink-0 bg-center bg-cover bg-no-repeat border border-slate-700"
      // 크기와 배경 이미지 동적 지정
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${url}")`,
      }}
      aria-label="프로필 이미지" // 접근성 라벨
      role="img" // 접근성 역할
    />
  );
}

export default function MyPage() {
  const router = useRouter();

  // 카드 클릭 핸들러 - 상세페이지로 이동
  const handleCardClick = (fundingId: number) => {
    console.log('카드 클릭:', fundingId);
    router.push(`/detail/${fundingId}`);
  };

  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 내가 제안한 상영회 상태
  const [myProposals, setMyProposals] = useState<FundingProposal[]>([]);
  const [isProposalsLoading, setIsProposalsLoading] = useState(true);
  const [hasMoreProposals, setHasMoreProposals] = useState(false);
  const [proposalType, setProposalType] = useState<'funding' | 'vote' | undefined>(undefined);

  // 내가 참여한 상영회 상태
  const [myParticipated, setMyParticipated] = useState<ParticipatedFunding[]>([]);
  const [isParticipatedLoading, setIsParticipatedLoading] = useState(true);
  const [hasMoreParticipated, setHasMoreParticipated] = useState(false);
  const [participatedState, setParticipatedState] = useState<'ALL' | 'ON_PROGRESS' | 'CLOSE' | undefined>(undefined);

  // 내가 보고싶어요 한 상영회 상태
  const [myLiked, setMyLiked] = useState<LikedFunding[]>([]);
  const [isLikedLoading, setIsLikedLoading] = useState(true);
  const [hasMoreLiked, setHasMoreLiked] = useState(false);
  const [likedType, setLikedType] = useState<'funding' | 'vote' | undefined>(undefined);

  // 카드 관리 모달 상태
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // 환불 계좌 수정 모달 상태
  const [isRefundAccountModalOpen, setIsRefundAccountModalOpen] = useState(false);

  // 프로필 수정 모달 상태
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // const [imageurl,setImageurl] = useState<string>('');

  // state에 따른 뱃지 색상과 문구 매핑
  const getStateBadgeInfo = (state: string, fundingType: 'FUNDING' | 'VOTE') => {
    switch (state) {
      case 'SUCCESS':
        return { text: '성공', className: 'bg-emerald-400 text-slate-900' };
      case 'EVALUATING':
        return { text: '심사중', className: 'bg-amber-300 text-slate-900' };
      case 'REJECTED':
        return { text: '반려됨', className: 'bg-red-500 text-white' };
      case 'WAITING':
        return { text: '대기중', className: 'bg-amber-300 text-slate-900' };
      case 'ON_PROGRESS':
        return { text: fundingType === 'FUNDING' ? '진행중' : '진행중', className: 'bg-cyan-400 text-slate-900' };
      case 'FAILED':
        return { text: '실패', className: 'bg-red-500 text-white' };
      case 'VOTING':
        return { text: '진행중', className: 'bg-cyan-400 text-slate-900' };
      default:
        return { text: '알 수 없음', className: 'bg-slate-500 text-white' };
    }
  };

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const { user, isLoggedIn } = useAuthStore.getState();

        // 로그인하지 않은 경우
        if (!isLoggedIn() || !user?.userId) {
          setIsLoggedIn(false);
          setIsLoading(false);
          // 로그인 페이지로 리다이렉트
          router.push('/auth');
          return;
        }

        setIsLoggedIn(true);

        const response = await getUserInfo(user.userId);
        // response.data 예시: { nickname: '펀딩 테스트 유저', profile_img_url: 'https://picsum.photos/id/1/200' }
        // const { nickname, profile_img_url } = response.data as any; // 서버 응답 키가 스네이크 케이스로 내려온다고 보았는데
        console.log('response.data:', response.data);
        const { nickname, profileImgUrl } = response.data as any; // 서버 응답 키 카멜 케이스로 내려옴
        setUserInfo({
          nickname,
          // profileImgUrl: profile_img_url,   // 원래 camelCase로 변환 저장했는데 이미지가 렌더링 안 됨
          profileImgUrl: profileImgUrl,
        });
      } catch (err) {
        console.error('사용자 정보 조회 오류:', err);
        // API 서버가 준비되지 않은 경우 기본값 사용 (console 에러 방지)
        setUserInfo({
          nickname: '사용자',
          profileImgUrl: 'https://placehold.co/72x72',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 내가 제안한 상영회 조회
  const fetchMyProposals = async (type?: 'funding' | 'vote') => {
    try {
      setIsProposalsLoading(true);
      const { user, isLoggedIn } = useAuthStore.getState();

      // 로그인하지 않은 경우 빈 배열 설정
      if (!isLoggedIn() || !user?.userId) {
        setMyProposals([]);
        setHasMoreProposals(false);
        return;
      }

      // API에서 데이터 가져오기 (type 파라미터 전달)
      const response = await getFundingProposals(user.userId, type, undefined, 15);
      let proposalsData = response.data.content;

      // 클라이언트에서 추가 필터링 (fundingType 기준으로 한 번 더 확인)
      if (type === 'funding') {
        proposalsData = proposalsData.filter((item) => item.funding.fundingType === 'FUNDING');
      } else if (type === 'vote') {
        proposalsData = proposalsData.filter((item) => item.funding.fundingType === 'VOTE');
      }

      setMyProposals(proposalsData);
      setHasMoreProposals(response.data.hasNextPage);
    } catch (err) {
      console.error('내가 제안한 상영회 조회 오류:', err);
      setMyProposals([]);
      setHasMoreProposals(false);
    } finally {
      setIsProposalsLoading(false);
    }
  };

  // 내가 제안한 상영회 조회 (초기 로드)
  useEffect(() => {
    fetchMyProposals();
  }, []);

  // 타입 필터 변경 시 재조회
  useEffect(() => {
    if (proposalType !== undefined) {
      fetchMyProposals(proposalType);
    } else {
      // proposalType이 undefined일 때는 전체 데이터 조회
      fetchMyProposals();
    }
  }, [proposalType]);

  // 내가 참여한 상영회 조회
  const fetchMyParticipated = async (state?: 'ALL' | 'ON_PROGRESS' | 'CLOSE') => {
    try {
      setIsParticipatedLoading(true);
      const { user, isLoggedIn } = useAuthStore.getState();

      // 로그인하지 않은 경우 빈 배열 설정
      if (!isLoggedIn() || !user?.userId) {
        setMyParticipated([]);
        setHasMoreParticipated(false);
        return;
      }

      const response = await getParticipatedFunding(user.userId, state, undefined, 15);
      let participatedData = response.data.content;

      // 클라이언트에서 2차 필터링
      if (state === 'ON_PROGRESS') {
        // 진행중: ON_PROGRESS, WAITING 상태만 필터링
        participatedData = participatedData.filter((item) => item.funding.state === 'ON_PROGRESS' || item.funding.state === 'WAITING');
      } else if (state === 'CLOSE') {
        // 진행 완료: FAILED, SUCCESS 상태만 필터링
        participatedData = participatedData.filter((item) => item.funding.state === 'FAILED' || item.funding.state === 'SUCCESS');
      }
      // state === 'ALL' 또는 undefined인 경우 필터링하지 않음

      setMyParticipated(participatedData);
      setHasMoreParticipated(response.data.hasNextPage);
    } catch (err) {
      console.error('내가 참여한 상영회 조회 오류:', err);
      setMyParticipated([]);
      setHasMoreParticipated(false);
    } finally {
      setIsParticipatedLoading(false);
    }
  };

  // 내가 참여한 상영회 조회 (초기 로드)
  useEffect(() => {
    fetchMyParticipated();
  }, []);

  // 상태 필터 변경 시 재조회
  useEffect(() => {
    if (participatedState !== undefined) {
      fetchMyParticipated(participatedState);
    } else {
      // participatedState가 undefined일 때는 전체 데이터 조회
      fetchMyParticipated('ALL');
    }
  }, [participatedState]);

  // 내가 보고싶어요 한 상영회 조회
  const fetchMyLiked = async (type?: 'funding' | 'vote') => {
    try {
      setIsLikedLoading(true);
      const { user, isLoggedIn } = useAuthStore.getState();

      // 로그인하지 않은 경우 빈 배열 설정
      if (!isLoggedIn() || !user?.userId) {
        setMyLiked([]);
        setHasMoreLiked(false);
        return;
      }

      // API에서 데이터 가져오기 (type 파라미터 전달)
      const response = await getLikedFunding(user.userId, type, undefined, 15);
      let likedData = response.data?.content || [];

      // 클라이언트에서 추가 필터링 (price 기준으로 한 번 더 확인)
      if (type === 'funding') {
        likedData = likedData.filter((item) => item.funding.price > 0);
      } else if (type === 'vote') {
        likedData = likedData.filter((item) => item.funding.price <= 0);
      }

      setMyLiked(likedData);
      setHasMoreLiked(response.data?.hasNextPage || false);
    } catch (err) {
      console.error('내가 보고싶어요 한 상영회 조회 오류:', err);
      setMyLiked([]);
      setHasMoreLiked(false);
    } finally {
      setIsLikedLoading(false);
    }
  };

  // 내가 보고싶어요 한 상영회 조회 (초기 로드)
  useEffect(() => {
    fetchMyLiked();
  }, []);

  // 타입 필터 변경 시 API 재요청
  useEffect(() => {
    if (likedType !== undefined) {
      fetchMyLiked(likedType);
    } else {
      // likedType이 undefined일 때는 전체 데이터 조회
      fetchMyLiked();
    }
  }, [likedType]);

  // CardItem을 ApiSearchItem으로 변환하는 함수
  const convertCardItemToApiSearchItem = (cardItem: CardItem): ApiSearchItem => {
    return {
      funding: {
        ...cardItem.funding,
        state: cardItem.funding.state as any,
        screenDate: cardItem.funding.screenDate || '',
      },
      cinema: cardItem.cinema,
    };
  };

  // API 데이터를 CardItem 형식으로 변환
  // 내가 제안한 상영회 데이터를 CardItem 형식으로 변환
  const convertToCardData = (proposal: FundingProposal): CardItem => {
    return {
      funding: {
        ...proposal.funding,
        state: proposal.funding.state as any,
        screenDate: proposal.funding.screenDate || '',
      },
      cinema: {
        cinemaId: proposal.cinema.cinemaId,
        cinemaName: proposal.cinema.cinemaName,
        city: proposal.cinema.city,
        district: proposal.cinema.district,
      },
    };
  };

  // 참여한 상영회 데이터를 CardItem 형식으로 변환
  const convertParticipatedToCardData = (participated: ParticipatedFunding): CardItem => {
    return {
      funding: {
        ...participated.funding,
        state: participated.funding.state as any,
        screenDate: participated.funding.screenDate || '',
      },
      cinema: {
        cinemaId: participated.cinema.cinemaId,
        cinemaName: participated.cinema.cinemaName,
        city: participated.cinema.city,
        district: participated.cinema.district,
      },
    };
  };

  // 보고싶어요 한 상영회 데이터를 CardItem 형식으로 변환
  const convertLikedToCardData = (liked: LikedFunding): CardItem => {
    // price가 0보다 크면 FUNDING, 아니면 VOTE로 구분
    const fundingType = liked.funding.price > 0 ? 'FUNDING' : 'VOTE';

    return {
      funding: {
        ...liked.funding,
        fundingType: fundingType,
        state: liked.funding.state as any,
        screenDate: liked.funding.screenDate || '',
      },
      cinema: {
        cinemaId: liked.cinema.cinemaId,
        cinemaName: liked.cinema.cinemaName,
        city: liked.cinema.city,
        district: liked.cinema.district,
      },
    };
  };

  // 로그인하지 않은 경우 로딩 화면 표시 (리다이렉트 중)
  if (!isLoggedIn && !isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="text-center">
            <h2 className="h4-b text-primary mb-4">로그인 페이지로 이동 중...</h2>
            <p className="p2 text-secondary">잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="text-center">
            <h2 className="h4-b text-primary mb-4">로딩 중...</h2>
            <p className="p2 text-secondary">사용자 정보를 불러오고 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-5">
      {/* 프로필 섹션 */}
      <div className="col-span-12 px-5 py-7 my-10 bg-BG-1 rounded-2xl flex flex-col justify-start items-start gap-6">
        {/* PC: 한 줄 레이아웃 */}
        <div className="hidden sm:flex w-full justify-between items-center">
          <div className="w-full flex flex-col justify-start items-start gap-2.5">
            <div className="flex justify-start items-center gap-6">
              <Avatar src={userInfo?.profileImgUrl} size={72} />
              <div className="flex-1 min-w-0 px-1 flex flex-col justify-center items-start gap-2.5">
                <div className="text-primary h3-b">
                  {isLoading ? (
                    '로딩 중...'
                  ) : (
                    <>
                      <span className="text-primary">안녕하세요, </span>
                      <span className="text-Brand2-Strong">{userInfo?.nickname || '사용자'}님</span>
                    </>
                  )}
                </div>
                <div className="h-8 flex justify-start items-center gap-2 sm:gap-[14px]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 sm:w-[120px] px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600"
                    onClick={() => setIsRefundAccountModalOpen(true)}
                  >
                    환불 계좌 수정
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 sm:w-[120px] px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600"
                    onClick={() => setIsCardModalOpen(true)}
                  >
                    결제 카드 등록
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-28 px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600" onClick={() => setIsEditProfileModalOpen(true)}>
            프로필 수정
          </Button>
        </div>

        {/* 모바일: 세로 레이아웃 */}
        <div className="w-full sm:hidden flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={userInfo?.profileImgUrl} size={72} />
            <div className="text-primary h3-b">{isLoading ? '로딩 중...' : `${userInfo?.nickname || '사용자'}`}</div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <Button variant="secondary" size="sm" className="w-full px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600" onClick={() => setIsEditProfileModalOpen(true)}>
              프로필 수정
            </Button>
            <Button variant="secondary" size="sm" className="w-full px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600" onClick={() => setIsRefundAccountModalOpen(true)}>
              환불 계좌 수정
            </Button>
            <Button variant="secondary" size="sm" className="w-full px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600" onClick={() => setIsCardModalOpen(true)}>
              결제 카드 등록
            </Button>
          </div>
        </div>
      </div>

      {/* 상영회 섹션들 */}
      <div className="w-full px-2 inline-flex flex-col justify-start items-start gap-11">
        {/* 내가 제안한 상영회 섹션 */}
        <div className="w-full flex flex-col justify-start items-start gap-2.5">
          {/* 섹션 헤더 */}
          <div className="w-full flex items-center justify-between">
            <h2 className="text-h5-b">내가 제안한 상영회</h2>
            {/* {hasMoreProposals && ( */}
            <button onClick={() => router.push('/mypage/detail/proposals')} className="text-h6-b text-secondary ">
              더보기 →
            </button>
            {/* // )} */}
          </div>
          {/* 필터 버튼 그룹 */}
          <div className="flex gap-2">
            <Button
              variant={proposalType === undefined ? 'brand1' : 'secondary'}
              size="sm"
              className={`p3-b rounded-[15px] ${proposalType === undefined ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
              onClick={() => setProposalType(undefined)}
            >
              전체
            </Button>
            <Button
              variant={proposalType === 'funding' ? 'brand1' : 'secondary'}
              size="sm"
              className={`p3-b rounded-[15px]  ${proposalType === 'funding' ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
              onClick={() => setProposalType('funding')}
            >
              펀딩
            </Button>
            <Button
              variant={proposalType === 'vote' ? 'brand1' : 'secondary'}
              size="sm"
              className={`p3-b rounded-[15px]  ${proposalType === 'vote' ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
              onClick={() => setProposalType('vote')}
            >
              투표
            </Button>
          </div>
          {/* 상영회 카드 */}
          <div className="self-stretch inline-flex justify-start items-center gap-2">
            {myProposals.length === 0 ? (
              <div className="w-full flex justify-center items-center">
                <div className="flex flex-col justify-center items-center gap-4">
                  <div className="text-center">
                    <div className="p1-b text-secondary mb-2">내가 제안한 상영회가 없습니다</div>
                    <div className="p3 text-tertiary">프로젝트를 시작해보세요</div>
                  </div>
                  <Button onClick={() => router.push('/create')} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    프로젝트 생성하기
                  </Button>
                </div>
              </div>
            ) : (
              <HorizontalScroller className="w-full">
                {myProposals.map((proposal, index) => (
                  <div key={proposal.funding.fundingId} className="w-[172px] flex-shrink-0">
                    <CineCardVertical
                      data={convertCardItemToApiSearchItem(convertToCardData(proposal))}
                      onCardClick={handleCardClick}
                      onVoteClick={(id) => console.log('투표 클릭:', id)}
                      showStateTag={true}
                      stateTagClassName="state state-active"
                      getStateBadgeInfo={getStateBadgeInfo}
                    />
                  </div>
                ))}
              </HorizontalScroller>
            )}
          </div>
        </div>

        {/* 내가 참여한 상영회 섹션 */}
        {myParticipated.length > 0 && (
          <div className="w-full flex flex-col justify-start items-start gap-2.5">
            {/* 섹션 헤더 */}
            <div className="w-full flex items-center justify-between">
              <h2 className="text-h5-b">내가 참여한 상영회</h2>
              {/* {hasMoreParticipated && ( */}
              <button onClick={() => router.push('/mypage/detail/participated')} className="text-h6-b text-secondary">
                더보기 →
              </button>
              {/* )} */}
            </div>
            {/* 필터 버튼 그룹 */}
            <div className="flex gap-2">
              <Button
                variant={participatedState === undefined ? 'brand1' : 'secondary'}
                size="sm"
                className={`p3-b rounded-[15px]  ${participatedState === undefined ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
                onClick={() => setParticipatedState(undefined)}
              >
                전체
              </Button>
              <Button
                variant={participatedState === 'ON_PROGRESS' ? 'brand1' : 'secondary'}
                size="sm"
                className={`p3-b rounded-[15px]  ${participatedState === 'ON_PROGRESS' ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
                onClick={() => setParticipatedState('ON_PROGRESS')}
              >
                진행중
              </Button>
              <Button
                variant={participatedState === 'CLOSE' ? 'brand1' : 'secondary'}
                size="sm"
                className={`p3-b rounded-[15px]  ${participatedState === 'CLOSE' ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
                onClick={() => setParticipatedState('CLOSE')}
              >
                진행 완료
              </Button>
            </div>
            {/* 상영회 카드 */}
            <div className="self-stretch inline-flex justify-start items-center gap-2 overflow-hidden">
              {myParticipated.length === 0 ? (
                <div className="w-full flex justify-center items-center h-80">
                  <div className="flex flex-col justify-center items-center gap-4">
                    <div className="text-center">
                      <div className="text-slate-400 text-lg font-medium mb-2">참여한 상영회가 없습니다</div>
                      <div className="text-slate-500 text-sm">상영회에 참여해보세요</div>
                    </div>
                    <Button onClick={() => router.push('/')} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      상영회 둘러보기
                    </Button>
                  </div>
                </div>
              ) : (
                <HorizontalScroller className="w-full">
                  {myParticipated.map((participated, index) => (
                    <div key={participated.funding.fundingId} className="w-[172px] flex-shrink-0">
                      <CineCardVertical
                        data={convertCardItemToApiSearchItem(convertParticipatedToCardData(participated))}
                        onCardClick={handleCardClick}
                        onVoteClick={(id) => console.log('투표 클릭:', id)}
                        showStateTag={true}
                        stateTagClassName="state state-active"
                        getStateBadgeInfo={getStateBadgeInfo}
                      />
                    </div>
                  ))}
                </HorizontalScroller>
              )}
            </div>
          </div>
        )}

        {/* 내가 보고 싶은 상영회 섹션 */}
        {myLiked.length > 0 && (
          <div className="w-full flex flex-col justify-start items-start gap-2.5">
            {/* 섹션 헤더 */}
            <div className="w-full flex items-center justify-between">
              <h2 className="text-h5-b">내가 보고 싶은 상영회</h2>
              {/* {hasMoreLiked && ( */}
              <button onClick={() => router.push('/mypage/detail/liked')} className="text-h6-b text-secondary hover:text-slate-400 transition-colors">
                더보기 →
              </button>
              {/* )} */}
            </div>
            {/* 필터 버튼 그룹 */}
            <div className="flex gap-2">
              <Button
                variant={likedType === undefined ? 'brand1' : 'secondary'}
                size="sm"
                className={`p3-b rounded-[15px]  ${likedType === undefined ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
                onClick={() => setLikedType(undefined)}
              >
                전체
              </Button>
              <Button
                variant={likedType === 'funding' ? 'brand1' : 'secondary'}
                size="sm"
                className={`p3-b rounded-[15px]  ${likedType === 'funding' ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
                onClick={() => setLikedType('funding')}
              >
                펀딩
              </Button>
              <Button
                variant={likedType === 'vote' ? 'brand1' : 'secondary'}
                size="sm"
                className={`p3-b rounded-[15px]  ${likedType === 'vote' ? 'bg-red-500 text-slate-300' : 'bg-slate-800 text-slate-400'}`}
                onClick={() => setLikedType('vote')}
              >
                투표
              </Button>
            </div>
            {/* 상영회 카드 */}
            <div className="self-stretch inline-flex justify-start items-center gap-2 overflow-hidden">
              {!myLiked || myLiked.length === 0 ? (
                <div className="w-full flex justify-center items-center h-80">
                  <div className="flex flex-col justify-center items-center gap-4">
                    <div className="text-center">
                      <div className="text-slate-400 text-lg font-medium mb-2">보고 싶은 상영회가 없습니다</div>
                      <div className="text-slate-500 text-sm">보고 싶은 상영회를 저장해보세요</div>
                    </div>
                    <Button onClick={() => router.push('/category')} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      둘러보기
                    </Button>
                  </div>
                </div>
              ) : (
                <HorizontalScroller className="w-full">
                  {myLiked &&
                    myLiked.map((liked, index) => (
                      <div key={liked.funding.fundingId} className="w-[172px] flex-shrink-0">
                        <CineCardVertical
                          data={convertCardItemToApiSearchItem(convertLikedToCardData(liked))}
                          onCardClick={handleCardClick}
                          onVoteClick={(id) => console.log('투표 클릭:', id)}
                          showStateTag={true}
                          stateTagClassName="state state-active"
                          getStateBadgeInfo={getStateBadgeInfo}
                        />
                      </div>
                    ))}
                </HorizontalScroller>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 카드 관리 모달 */}
      <CardManagement isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} />

      {/* 환불 계좌 수정 모달 */}
      <RefundAccountModal isOpen={isRefundAccountModalOpen} onClose={() => setIsRefundAccountModalOpen(false)} />

      {/* 프로필 수정 모달 */}
      <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} currentNickname={userInfo?.nickname} />
    </div>
  );
}
