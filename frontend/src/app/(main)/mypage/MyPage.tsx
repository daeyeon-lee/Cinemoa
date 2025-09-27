'use client';

import { useState, useEffect } from 'react';
import { getUserInfo, getFundingProposals, getParticipatedFunding, getLikedFunding } from '@/api/mypage';
import type { UserInfo, FundingProposal, ParticipatedFunding, LikedFunding } from '@/types/mypage';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import CardManagement from '@/app/(main)/mypage/component/CardManagement';
import RefundAccountModal from '@/app/(main)/mypage/component/RefundAccountModal';
import EditProfileModal from '@/app/(main)/mypage/component/EditProfileModal';
import { useFundingLike } from '@/hooks/queries/useFunding';
import ProfileSection from '@/app/(main)/mypage/sections/ProfileSection';
import ProposalsSection from '@/app/(main)/mypage/sections/ProposalsSection';
import ParticipatedSection from '@/app/(main)/mypage/sections/ParticipatedSection';
import LikedSection from '@/app/(main)/mypage/sections/LikedSection';

export default function MyPage() {
  const router = useRouter();

  // 카드 클릭 핸들러 - 상세페이지로 이동
  const handleCardClick = (fundingId: number) => {
    // console.log('카드 클릭:', fundingId);
    router.push(`/detail/${fundingId}`);
  };

  // 좋아요 클릭 핸들러 - 마이페이지 데이터 직접 업데이트
  const handleVoteClick = (fundingId: number) => {
    const { user } = useAuthStore.getState();
    if (!user?.userId) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    // 현재 좋아요 상태 찾기
    let currentIsLiked = false;

    // 내가 제안한 상영회에서 찾기
    const proposalItem = myProposals.find((item) => item.funding.fundingId === fundingId);
    if (proposalItem) {
      currentIsLiked = proposalItem.funding.isLiked || false;
    }

    // 내가 참여한 상영회에서 찾기
    const participatedItem = myParticipated.find((item) => item.funding.fundingId === fundingId);
    if (participatedItem) {
      currentIsLiked = participatedItem.funding.isLiked || false;
    }

    // 내가 보고싶어요 한 상영회에서 찾기
    const likedItem = myLiked.find((item) => item.funding.fundingId === fundingId);
    if (likedItem) {
      currentIsLiked = likedItem.funding.isLiked || false;
    }

    // console.log('❤️ [MyPage] 좋아요 토글:', { fundingId, currentIsLiked });

    // React Query mutation 실행
    likeMutation.mutate({
      fundingId,
      userId: String(user.userId),
      isLiked: currentIsLiked,
    });

    // 마이페이지 데이터 직접 업데이트
    const updateLikeStatus = (items: any[], setItems: (items: any[]) => void) => {
      const updatedItems = items.map((item) => {
        if (item.funding.fundingId === fundingId) {
          return {
            ...item,
            funding: {
              ...item.funding,
              isLiked: !currentIsLiked,
              favoriteCount: currentIsLiked ? (item.funding.favoriteCount || 0) - 1 : (item.funding.favoriteCount || 0) + 1,
            },
          };
        }
        return item;
      });
      setItems(updatedItems);
    };

    // 각 섹션별로 업데이트
    updateLikeStatus(myProposals, setMyProposals);
    updateLikeStatus(myParticipated, setMyParticipated);
    updateLikeStatus(myLiked, setMyLiked);
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

  // 좋아요 토글을 위한 훅
  const likeMutation = useFundingLike();

  // const [imageurl,setImageurl] = useState<string>('');

  // state에 따른 뱃지 색상과 문구 매핑
  // 진행 중 배지 없애기, 진행 중, 완료는 카드 어두워진걸로 확인-오서로
  const getStateBadgeInfo = (state: string, fundingType: 'FUNDING' | 'VOTE') => {
    switch (state) {
      case 'SUCCESS':
        return { text: '성공', className: 'bg-emerald-500 text-inverse' };
      case 'EVALUATING':
        return { text: '심사중', className: 'bg-amber-300 text-inverse' }; // 현재 없음
      case 'REJECTED':
        return { text: '반려됨', className: 'bg-Brand1-Strong text-primary' };
      case 'WAITING':
        return { text: '대기중', className: 'bg-amber-300 text-inverse' }; // 현재 없음
      case 'ON_PROGRESS':
        return { text: fundingType === 'FUNDING' ? '진행중' : '진행중', className: 'bg-Brand2-Strong text-inverse' };
      case 'FAILED':
        return { text: '실패', className: 'bg-Brand1-Strong text-primary' };
      case 'VOTING':
        return { text: '진행중', className: 'bg-Brand2-Strong text-inverse' };
      default:
        return { text: '알 수 없음', className: 'bg-Brand1-Strong text-primary' }; // 현재 없음
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
        // console.log('response.data:', response.data);
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
      <ProfileSection userInfo={userInfo} isLoading={isLoading} />

      {/* 상영회 섹션들 */}
      <div className="w-full px-2 inline-flex flex-col justify-start items-start gap-11">
        {/* 내가 제안한 상영회 섹션 */}
        <ProposalsSection
          myProposals={myProposals}
          isProposalsLoading={isProposalsLoading}
          proposalType={proposalType}
          setProposalType={setProposalType}
          handleCardClick={handleCardClick}
          handleVoteClick={handleVoteClick}
          getStateBadgeInfo={getStateBadgeInfo}
        />

        {/* 내가 참여한 상영회 섹션 */}
        <ParticipatedSection
          myParticipated={myParticipated}
          isParticipatedLoading={isParticipatedLoading}
          participatedState={participatedState}
          setParticipatedState={setParticipatedState}
          handleCardClick={handleCardClick}
          handleVoteClick={handleVoteClick}
          getStateBadgeInfo={getStateBadgeInfo}
        />

        {/* 내가 보고 싶은 상영회 섹션 */}
        <LikedSection
          myLiked={myLiked}
          isLikedLoading={isLikedLoading}
          likedType={likedType}
          setLikedType={setLikedType}
          handleCardClick={handleCardClick}
          handleVoteClick={handleVoteClick}
          getStateBadgeInfo={getStateBadgeInfo}
        />
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
