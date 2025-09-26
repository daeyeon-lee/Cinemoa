import React from 'react';
import { Button } from '@/components/ui/button'; // 버튼 컴포넌트
// import { Skeleton } from '@/components/ui/skeleton';              // 로딩 스켈레톤
import { StatItem } from '@/components/cards/primitives/StatItem';
import { ShareButton } from '@/components/share/ShareButton'; // 공유 버튼 컴포넌트
import { useFundingLike, useFundingDetail } from '@/hooks/queries'; // 리액트 쿼리 훅(상세/좋아요 토글)
import { useAuthStore } from '@/stores/authStore'; // 로그인 사용자 상태
import { useVoteDetail as useVoteDetailContext } from '@/contexts/VoteDetailContext';
import { useRouter } from 'next/navigation';

// ✅ 투표 전용 액션 섹션 Props
type VoteActionSectionProps = {
  fundingId: number;
  isExpired?: boolean; // 🆕 마감 여부
};

const VoteActionSection: React.FC<VoteActionSectionProps> = ({ fundingId, isExpired }) => {
  const router = useRouter();
  
  // Context에서 데이터 가져오기
  const { data: contextData, userId: contextUserId } = useVoteDetailContext();
  const { funding, proposer } = contextData;

  // 로그인 사용자 정보
  const { user } = useAuthStore();
  const storeUserId = user?.userId?.toString();

  // ✅ context → store 순으로 fallback
  const userId = contextUserId || storeUserId;

  // 남은 날짜 계산
  const calculateDaysLeft = (endDateString: string): number => {
    const endDateObj = new Date(endDateString);
    const now = new Date();
    const diffTime = endDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = calculateDaysLeft(funding.fundingEndsOn);

  // 🆕 제안자 권한 체크: proposerId와 현재 userId가 같은지 확인
  const isProposer = proposer?.proposerId?.toString() === userId;

  // 좋아요 토글 mutation
  const likeMutation = useFundingLike();

  // 상세데이터 캐시 조회 (React Query로 최신 상태 유지)
  const { data: detailData } = useFundingDetail({
    fundingId: fundingId.toString(),
    userId,
  });

  // console.log("VoteActionSection userId", userId)

  let currentIsLiked = false; // 현재 좋아요 여부
  let currentLikeCount = 0; // 현재 좋아요 수

  if (detailData?.type === 'VOTE') {
    currentIsLiked = detailData.stat.isLiked;
    currentLikeCount = detailData.stat.likeCount;
  }

  // ✅ 좋아요 버튼 클릭: 미로그인 방지 + 낙관적 업데이트
  const handleLikeClick = () => {
    if (!userId) {
      // 로그인 필요 체크
      alert('로그인 후 이용해주세요.');
      window.location.href = '/auth';
      return;
    }
    likeMutation.mutate({
      fundingId, // 펀딩 식별자
      userId, // 필수: 서버 API 요구
      isLiked: currentIsLiked, // 현재값 기반 토글
    });
  };

  // 🆕 상영회 전환 버튼 클릭
  const handleConvertToFunding = () => {
    if (!userId) {
      // 로그인 필요 체크
      alert('로그인 후 이용해주세요.');
      router.push('/auth');
      return;
    }
    // create/funding 페이지로 이동하면서 fundingId와 userId 전달
    router.push(`/create/funding?fundingId=${fundingId}&userId=${userId}`);
  };

  return (
    <section>
      <div className="flex flex-col pt-5 border-t border-slate-600 gap-4">
        {/* 참여자수 + 남은시간 */}
        <div className="w-full min-w-0 flex items-center justify-between mt-1.5">
          <div className="min-w-0">
            <StatItem icon="people" fill={isExpired ? "#94A3B8" : "#2CD8CE"} text={`${currentLikeCount}명이 보고 싶어해요`} />
          </div>
          <div className="min-w-0">
            <StatItem icon="time" fill={isExpired ? "#94A3B8" : "#2CD8CE"} text={isExpired ? "마감" : `${daysLeft}일 후 종료`} />
          </div>
        </div>
        {/* 🔘 액션 버튼 영역: 좋아요 + 참여하기(결제) */}
        <div className="w-full inline-flex justify-start items-center gap-2">
          {/* 링크 공유 */}
          <ShareButton isActive={currentIsLiked} />

          {/* ❤️ 좋아요/상영회 전환/마감 버튼 */}
          <Button
            variant={
              isExpired 
                ? (isProposer ? 'brand2' : 'secondary') // 마감시: 제안자면 brand2, 아니면 secondary(회색)
                : (currentIsLiked ? 'tertiary' : 'brand2') // 진행중: 좋아요 상태에 따라
            }
            size="lg" // 라지 사이즈
            textSize="lg" // 라지 폰트 (커스텀 prop 가정)
            className="w-full h5-b gap-1" // 공통 스타일만 유지
            onClick={
              isExpired 
                ? (isProposer ? handleConvertToFunding : undefined) // 마감시: 제안자만 클릭 가능
                : handleLikeClick // 진행중: 좋아요 핸들러
            }
            disabled={
              likeMutation.isPending || // 좋아요 요청 중이거나
              (isExpired && !isProposer) // 마감됐는데 제안자가 아닌 경우
            }
          >
            {isExpired 
              ? (isProposer ? '상영회로 전환하기' : '마감되었습니다') // 마감시: 제안자 여부에 따라
              : (currentIsLiked ? '보고 싶어요 취소' : '나도 보고 싶어요') // 진행중: 좋아요 상태에 따라
            }
          </Button>
        </div>
      </div>
    </section>
  );
};

export { VoteActionSection };
export type { VoteActionSectionProps };
