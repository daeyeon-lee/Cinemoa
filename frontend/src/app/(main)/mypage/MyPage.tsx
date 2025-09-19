"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import type { ListCardData } from '@/components/cards/CineCardVertical';
import { getUserInfo, getFundingProposals, getParticipatedFunding } from '@/api/mypage';
import type { UserInfo, FundingProposal, ParticipatedFunding } from '@/types/mypage';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

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
      role="img"                 // 접근성 역할
    />
  );
}

export default function MyPage() {
  const router = useRouter();
  
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
        
        // 로그인하지 않은 경우 기본값 설정
        if (!isLoggedIn() || !user?.userId) {
          setUserInfo({
            nickname: '사용자',
            profileImgUrl: 'https://placehold.co/72x72'
          });
          return;
        }

        const response = await getUserInfo(user.userId);
        // response.data 예시: { nickname: '펀딩 테스트 유저', profile_img_url: 'https://picsum.photos/id/1/200' }
        const { nickname, profile_img_url } = response.data as any; // ← 서버 응답 키  // 서버 응답 키 설명: 스네이크 케이스로 내려옴
        setUserInfo({
          nickname,                         // ← 동일 키라 그대로 할당
          profileImgUrl: profile_img_url,   // ← 여기가 핵심: camelCase로 변환 저장
        });
        console.log(response.data);
      } catch (err) {
        console.error('사용자 정보 조회 오류:', err);
        // API 서버가 준비되지 않은 경우 기본값 사용 (console 에러 방지)
        setUserInfo({
          nickname: '사용자',
          profileImgUrl: 'https://placehold.co/72x72'
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

      const response = await getFundingProposals(user.userId, type, undefined, 7);
      setMyProposals(response.data.content); // 내가 제안한 상영회 목록 -> state 업데이트
      setHasMoreProposals(response.data.hasNextPage);
    } catch (err) {
      console.error('내가 제안한 상영회 조회 오류:', err);
      setMyProposals([]); // 내가 제안한 상영회 목록 -> state 초기화
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

      const response = await getParticipatedFunding(user.userId, state, undefined, 7);
      setMyParticipated(response.data.content);
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
    }
  }, [participatedState]);

  // API 데이터를 ListCardData 형식으로 변환
  const convertToCardData = (proposal: FundingProposal): ListCardData => {
    return {
      funding: {
        fundingId: proposal.funding.fundingId,
        title: proposal.funding.title,
        bannerUrl: proposal.funding.bannerUrl,
        state: proposal.funding.state,
        progressRate: proposal.funding.progressRate,
        fundingEndsOn: proposal.funding.fundingEndsOn,
        screenDate: proposal.funding.screenDate,
        price: proposal.funding.price,
        maxPeople: proposal.funding.maxPeople,
        participantCount: proposal.funding.participantCount,
        favoriteCount: proposal.funding.favoriteCount,
        isLiked: proposal.funding.isLiked,
        fundingType: proposal.funding.fundingType,
      },
      cinema: {
        cinemaId: proposal.cinema.cinemaId,
        cinemaName: proposal.cinema.cinemaName,
        city: proposal.cinema.city,
        district: proposal.cinema.district,
      },
    };
  };

  // 참여한 상영회 데이터를 ListCardData 형식으로 변환
  const convertParticipatedToCardData = (participated: ParticipatedFunding): ListCardData => {
    return {
      funding: {
        fundingId: participated.funding.fundingId,
        title: participated.funding.title,
        bannerUrl: participated.funding.bannerUrl,
        state: participated.funding.state,
        progressRate: participated.funding.progressRate,
        fundingEndsOn: participated.funding.fundingEndsOn,
        screenDate: participated.funding.screenDate,
        price: participated.funding.price,
        maxPeople: participated.funding.maxPeople,
        participantCount: participated.funding.participantCount,
        favoriteCount: participated.funding.favoriteCount,
        isLiked: participated.funding.isLiked,
        fundingType: participated.funding.fundingType,
      },
      cinema: {
        cinemaId: participated.cinema.cinemaId,
        cinemaName: participated.cinema.cinemaName,
        city: participated.cinema.city,
        district: participated.cinema.district,
      },
    };
  };

  // 샘플 데이터
  const sampleCardData: ListCardData = {
    funding: {
      fundingId: 1,
      title: '샘플 영화를 봅시다',
      bannerUrl: '/images/image.png',
      state: 'ACTIVE',
      progressRate: 75,
      fundingEndsOn: '2024-12-31T23:59:59',
      screenDate: '2025-01-15T19:00:00',
      price: 15000,
      maxPeople: 200,
      participantCount: 150,
      favoriteCount: 89,
      isLiked: false,
      fundingType: 'FUNDING' as const,
    },
    cinema: {
      cinemaId: 1,
      cinemaName: 'CGV 강남',
      city: '서울',
      district: '강남구',
    },
  };

  const sampleVoteData: ListCardData = {
    funding: {
      fundingId: 2,
      title: '투표 영화 제목',
      bannerUrl: '/images/image.png',
      state: 'ACTIVE',
      progressRate: 0,
      fundingEndsOn: '2024-12-31T23:59:59',
      screenDate: '2025-01-15T19:00:00',
      price: 0,
      maxPeople: 0,
      participantCount: 0,
      favoriteCount: 88888,
      isLiked: true,
      fundingType: 'VOTE' as const,
    },
    cinema: {
      cinemaId: 2,
      cinemaName: 'CGV 영등포',
      city: '서울',
      district: '영등포구',
    },
  };

  const myWishlist = Array(7).fill(sampleCardData);

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <main className="grid grid-cols-12 gap-6">
        {/* 프로필 섹션 */}
        <div className="col-span-12 min-w-[376px] px-3.5 sm:px-6 sm:px-14 py-3.5 sm:py-7 my-14 bg-slate-800 rounded-2xl flex flex-col justify-start items-start gap-6">
          {/* PC: 한 줄 레이아웃 */}
          <div className="hidden sm:flex w-full justify-between items-center">
            <div className="w-full flex flex-col justify-start items-start gap-2.5">
              <div className="flex justify-start items-center gap-6">
                <Avatar src={userInfo?.profileImgUrl} size={72} />
                <div className="flex-1 min-w-0 px-1 flex flex-col justify-center items-start gap-2.5">
                  <div className="text-slate-50 text-2xl font-bold leading-loose">
                    {isLoading ? '로딩 중...' : `${userInfo?.nickname || '사용자'}, 안녕하세요`}
                  </div>
                  <div className="h-8 flex justify-start items-center gap-[14px]">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-[120px] px-3 py-1.5 bg-slate-700 text-slate-300 text-sm font-normal rounded-md hover:bg-slate-600"
                    >
                      환불 계좌 수정
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-[120px] px-3 py-1.5 bg-slate-700 text-slate-300 text-sm font-normal rounded-md hover:bg-slate-600"
                    >
                      결제 카드 등록
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-28 px-3 py-1.5 bg-slate-700 text-slate-300 text-sm font-normal rounded-md hover:bg-slate-600"
            >
              프로필 관리
            </Button>
          </div>

          {/* 모바일: 두 줄 레이아웃 */}
          <div className="w-full sm:hidden flex justify-start items-center gap-5">
            <Avatar src={userInfo?.profileImgUrl} size={72} />
            <div className="flex flex-col flex-1 justify-start items-start gap-2">
              <div className="w-full flex justify-between items-center">
                <div className="text-slate-50 text-2xl font-bold leading-loose">
                  {isLoading ? '로딩 중...' : `${userInfo?.nickname || '사용자'}님, 안녕하세요`}
                </div>
                {/* <Button
                  variant="secondary"
                  size="sm"
                  className="w-8 h-8 p-0 bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center"
                > */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_756_6760)">
                    <path d="M7.99935 10C9.10392 10 9.99935 9.10457 9.99935 8C9.99935 6.89544 9.10392 6 7.99935 6C6.89478 6 5.99935 6.89544 5.99935 8C5.99935 9.10457 6.89478 10 7.99935 10Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.9327 10C12.8439 10.2011 12.8175 10.4241 12.8567 10.6404C12.8959 10.8567 12.999 11.0562 13.1527 11.2133L13.1927 11.2533C13.3167 11.3772 13.415 11.5242 13.4821 11.6861C13.5492 11.8479 13.5837 12.0215 13.5837 12.1967C13.5837 12.3719 13.5492 12.5454 13.4821 12.7073C13.415 12.8691 13.3167 13.0162 13.1927 13.14C13.0689 13.264 12.9218 13.3623 12.7599 13.4294C12.5981 13.4965 12.4246 13.5311 12.2493 13.5311C12.0741 13.5311 11.9006 13.4965 11.7388 13.4294C11.5769 13.3623 11.4298 13.264 11.306 13.14L11.266 13.1C11.1089 12.9463 10.9093 12.8432 10.6931 12.804C10.4768 12.7648 10.2538 12.7913 10.0527 12.88C9.8555 12.9645 9.68734 13.1048 9.56889 13.2837C9.45044 13.4626 9.38687 13.6721 9.38602 13.8867V14C9.38602 14.3536 9.24554 14.6928 8.99549 14.9428C8.74544 15.1929 8.4063 15.3333 8.05268 15.3333C7.69906 15.3333 7.35992 15.1929 7.10987 14.9428C6.85982 14.6928 6.71935 14.3536 6.71935 14V13.94C6.71419 13.7193 6.64276 13.5053 6.51436 13.3258C6.38595 13.1463 6.20651 13.0095 5.99935 12.9333C5.79827 12.8446 5.57522 12.8181 5.35896 12.8573C5.14269 12.8965 4.94313 12.9996 4.78602 13.1533L4.74602 13.1933C4.62218 13.3173 4.47513 13.4157 4.31327 13.4828C4.1514 13.5498 3.9779 13.5844 3.80268 13.5844C3.62746 13.5844 3.45396 13.5498 3.2921 13.4828C3.13023 13.4157 2.98318 13.3173 2.85935 13.1933C2.73538 13.0695 2.63703 12.9225 2.56994 12.7606C2.50284 12.5987 2.4683 12.4252 2.4683 12.25C2.4683 12.0748 2.50284 11.9013 2.56994 11.7394C2.63703 11.5776 2.73538 11.4305 2.85935 11.3067L2.89935 11.2667C3.05304 11.1096 3.15614 10.91 3.19535 10.6937C3.23456 10.4775 3.20809 10.2544 3.11935 10.0533C3.03484 9.85616 2.89452 9.68799 2.71566 9.56954C2.5368 9.45109 2.32721 9.38753 2.11268 9.38667H1.99935C1.64573 9.38667 1.30659 9.2462 1.05654 8.99615C0.806491 8.7461 0.666016 8.40696 0.666016 8.05334C0.666016 7.69972 0.806491 7.36058 1.05654 7.11053C1.30659 6.86048 1.64573 6.72 1.99935 6.72H2.05935C2.28001 6.71484 2.49402 6.64342 2.67355 6.51501C2.85308 6.38661 2.98983 6.20716 3.06602 6C3.15476 5.79893 3.18123 5.57588 3.14202 5.35961C3.10281 5.14335 2.99971 4.94379 2.84602 4.78667L2.80602 4.74667C2.68205 4.62284 2.5837 4.47579 2.5166 4.31393C2.4495 4.15206 2.41497 3.97856 2.41497 3.80334C2.41497 3.62812 2.4495 3.45462 2.5166 3.29275C2.5837 3.13089 2.68205 2.98384 2.80602 2.86C2.92985 2.73604 3.0769 2.63769 3.23876 2.57059C3.40063 2.50349 3.57413 2.46896 3.74935 2.46896C3.92457 2.46896 4.09807 2.50349 4.25994 2.57059C4.4218 2.63769 4.56885 2.73604 4.69268 2.86L4.73268 2.9C4.8898 3.0537 5.08936 3.1568 5.30562 3.19601C5.52189 3.23522 5.74494 3.20875 5.94602 3.12H5.99935C6.19653 3.0355 6.36469 2.89518 6.48314 2.71632C6.60159 2.53746 6.66516 2.32786 6.66602 2.11334V2.00001C6.66602 1.64638 6.80649 1.30724 7.05654 1.0572C7.30659 0.807148 7.64573 0.666672 7.99935 0.666672C8.35297 0.666672 8.69211 0.807148 8.94216 1.0572C9.19221 1.30724 9.33268 1.64638 9.33268 2.00001V2.06C9.33354 2.27453 9.3971 2.48412 9.51555 2.66298C9.634 2.84184 9.80217 2.98216 9.99935 3.06667C10.2004 3.15541 10.4235 3.18189 10.6397 3.14267C10.856 3.10346 11.0556 3.00036 11.2127 2.84667L11.2527 2.80667C11.3765 2.6827 11.5236 2.58436 11.6854 2.51726C11.8473 2.45016 12.0208 2.41562 12.196 2.41562C12.3712 2.41562 12.5447 2.45016 12.7066 2.51726C12.8685 2.58436 13.0155 2.6827 13.1393 2.80667C13.2633 2.9305 13.3617 3.07755 13.4288 3.23942C13.4959 3.40128 13.5304 3.57478 13.5304 3.75C13.5304 3.92523 13.4959 4.09873 13.4288 4.26059C13.3617 4.42246 13.2633 4.56951 13.1393 4.69334L13.0993 4.73334C12.9457 4.89046 12.8426 5.09002 12.8033 5.30628C12.7641 5.52254 12.7906 5.74559 12.8793 5.94667V6C12.9639 6.19718 13.1042 6.36535 13.283 6.4838C13.4619 6.60225 13.6715 6.66582 13.886 6.66667H13.9993C14.353 6.66667 14.6921 6.80715 14.9422 7.0572C15.1922 7.30724 15.3327 7.64638 15.3327 8C15.3327 8.35363 15.1922 8.69276 14.9422 8.94281C14.6921 9.19286 14.353 9.33334 13.9993 9.33334H13.9393C13.7248 9.33419 13.5152 9.39776 13.3364 9.51621C13.1575 9.63466 13.0172 9.80283 12.9327 10Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_756_6760">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                {/* </Button> */}
              </div>
              <div className="w-64 h-8 flex justify-between items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-[120px] px-3 py-1.5 bg-slate-700 text-slate-300 text-sm font-normal rounded-md hover:bg-slate-600"
                >
                  환불 계좌 수정
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-[120px] px-3 py-1.5 bg-slate-700 text-slate-300 text-sm font-normal rounded-md hover:bg-slate-600"
                >
                  결제 카드 등록
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 상영회 섹션들 */}
        {/* 
                    gap-[45px]는 Tailwind 기준으로 약 2.8125rem(45/16)입니다.
                    Tailwind의 gap-11은 2.75rem(44px), gap-12는 3rem(48px)입니다.
                    45px에 가장 가까운 것은 gap-11(44px)입니다.
                    gap-11을 사용하면 거의 동일합니다.
                */}
        <div className="col-span-12 inline-flex flex-col justify-start items-start gap-11">
          {/* 내가 제안한 상영회 섹션 */}
          <div className="w-full flex flex-col justify-start items-start gap-2.5">
            {/* 섹션 헤더 */}
            <div className="w-full flex items-center justify-between">
              <h2 className="text-h5-b">내가 제안한 상영회</h2>
              {hasMoreProposals && (
                <button onClick={() => console.log('더보기')} className="text-p3 text-secondary hover:text-slate-400 transition-colors">
                  더보기 →
                </button>
              )}
            </div>
            {/* 필터 버튼 그룹 */}
            <div className="w-96 inline-flex justify-start items-center gap-2">
              <Button
                variant={proposalType === undefined ? "brand1" : "secondary"}
                size="sm"
                className={`h-6 px-3.5 py-1 text-xs font-semibold rounded-2xl ${
                  proposalType === undefined 
                    ? "bg-red-500 text-slate-300" 
                    : "bg-slate-800 text-slate-400"
                }`}
                onClick={() => setProposalType(undefined)}
              >
                전체
              </Button>
              <Button
                variant={proposalType === 'funding' ? "brand1" : "secondary"}
                size="sm"
                className={`h-6 px-3.5 py-1 text-xs font-semibold rounded-2xl ${
                  proposalType === 'funding' 
                    ? "bg-red-500 text-slate-300" 
                    : "bg-slate-800 text-slate-400"
                }`}
                onClick={() => setProposalType('funding')}
              >
                펀딩
              </Button>
              <Button
                variant={proposalType === 'vote' ? "brand1" : "secondary"}
                size="sm"
                className={`h-6 px-3.5 py-1 text-xs font-semibold rounded-2xl ${
                  proposalType === 'vote' 
                    ? "bg-red-500 text-slate-300" 
                    : "bg-slate-800 text-slate-400"
                }`}
                onClick={() => setProposalType('vote')}
              >
                투표
              </Button>
            </div>
            {/* 상영회 카드 */}
            <div className="self-stretch inline-flex justify-start items-center gap-2 overflow-hidden">
              {myProposals.length === 0 ? (
                <div className="w-full flex justify-center items-center h-80">
                  <div className="flex flex-col justify-center items-center gap-4">
                    <div className="text-center">
                      <div className="text-slate-400 text-lg font-medium mb-2">내가 제안한 상영회가 없습니다</div>
                      <div className="text-slate-500 text-sm">프로젝트를 시작해보세요</div>
                    </div>
                    <Button
                      onClick={() => router.push('/create')}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      프로젝트 생성하기
                    </Button>
                  </div>
                </div>
              ) : (
                <HorizontalScroller className="w-full">
                  {myProposals.map((proposal, index) => (
                    <div key={proposal.funding.fundingId} className="w-[172px] h-80 flex-shrink-0">
                      <CineCardVertical
                        data={convertToCardData(proposal)}
                        onCardClick={(id) => console.log('카드 클릭:', id)}
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
          <div className="w-full flex flex-col justify-start items-start gap-2.5">
            {/* 섹션 헤더 */}
            <div className="w-full flex items-center justify-between">
              <h2 className="text-h5-b">내가 참여한 상영회</h2>
              {hasMoreParticipated && (
                <button onClick={() => console.log('더보기')} className="text-p3 text-secondary hover:text-slate-400 transition-colors">
                  더보기 →
                </button>
              )}
            </div>
            {/* 필터 버튼 그룹 */}
            <div className="w-96 inline-flex justify-start items-center gap-2">
              <Button
                variant={participatedState === undefined ? "brand1" : "secondary"}
                size="sm"
                className={`h-6 px-3.5 py-1 text-xs font-semibold rounded-2xl ${
                  participatedState === undefined 
                    ? "bg-red-500 text-slate-300" 
                    : "bg-slate-800 text-slate-400"
                }`}
                onClick={() => setParticipatedState(undefined)}
              >
                전체
              </Button>
              <Button
                variant={participatedState === 'ON_PROGRESS' ? "brand1" : "secondary"}
                size="sm"
                className={`h-6 px-3.5 py-1 text-xs font-semibold rounded-2xl ${
                  participatedState === 'ON_PROGRESS' 
                    ? "bg-red-500 text-slate-300" 
                    : "bg-slate-800 text-slate-400"
                }`}
                onClick={() => setParticipatedState('ON_PROGRESS')}
              >
                진행중
              </Button>
              <Button
                variant={participatedState === 'CLOSE' ? "brand1" : "secondary"}
                size="sm"
                className={`h-6 px-3.5 py-1 text-xs font-semibold rounded-2xl ${
                  participatedState === 'CLOSE' 
                    ? "bg-red-500 text-slate-300" 
                    : "bg-slate-800 text-slate-400"
                }`}
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
                    <Button
                      onClick={() => router.push('/')}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      상영회 둘러보기
                    </Button>
                  </div>
                </div>
              ) : (
                <HorizontalScroller className="w-full">
                  {myParticipated.map((participated, index) => (
                    <div key={participated.funding.fundingId} className="w-[172px] h-80 flex-shrink-0">
                      <CineCardVertical
                        data={convertParticipatedToCardData(participated)}
                        onCardClick={(id) => console.log('카드 클릭:', id)}
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

          {/* 내가 보고 싶은 상영회 섹션 */}
          <div className="w-full flex flex-col justify-start items-start gap-2.5">
            {/* 섹션 헤더 */}
            <div className="w-full flex items-center justify-between">
              <h2 className="text-h5-b">내가 보고 싶은 상영회</h2>
              <button onClick={() => console.log('더보기')} className="text-p3 text-secondary hover:text-slate-400 transition-colors">
                더보기 →
              </button>
            </div>
            {/* 필터 버튼 그룹 */}
            <div className="w-96 inline-flex justify-start items-center gap-2">
              <Button
                variant="brand1"
                size="sm"
                className="h-6 px-3.5 py-1 bg-red-500 text-slate-300 text-xs font-semibold rounded-2xl"
              >
                전체
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-6 px-3.5 py-1 bg-slate-800 text-slate-400 text-xs font-semibold rounded-2xl"
              >
                펀딩
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-6 px-3.5 py-1 bg-slate-800 text-slate-400 text-xs font-semibold rounded-2xl"
              >
                투표
              </Button>
            </div>
            {/* 상영회 카드 */}
            <div className="self-stretch inline-flex justify-start items-center gap-2 overflow-hidden">
              <HorizontalScroller className="w-full">
                {myWishlist.map((item, index) => (
                  <div key={index} className="w-[172px] h-80 flex-shrink-0">
                    <CineCardVertical
                      data={item}
                      onCardClick={(id) => console.log('카드 클릭:', id)}
                      onVoteClick={(id) => console.log('투표 클릭:', id)}
                      showStateTag={true}
                      stateTagClassName="state state-active"
                    />
                  </div>
                ))}
              </HorizontalScroller>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}