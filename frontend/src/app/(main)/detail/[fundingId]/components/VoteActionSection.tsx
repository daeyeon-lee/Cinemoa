import React, { useState } from 'react';
import { Button } from '@/components/ui/button';                  // 버튼 컴포넌트
import ShareIcon from '@/component/icon/shareIcon';           // 하트 아이콘
// import { Skeleton } from '@/components/ui/skeleton';              // 로딩 스켈레톤
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';   // 모달 컴포넌트
import { StatItem } from '@/components/cards/primitives/StatItem';
import { useFundingLike, useFundingDetail } from '@/hooks/queries'; // 리액트 쿼리 훅(상세/좋아요 토글)
import { useAuthStore } from '@/stores/authStore';                // 로그인 사용자 상태
import { useVoteDetail as useVoteDetailContext } from '@/contexts/VoteDetailContext';
import { Input } from '@/components/ui/input';

// ✅ 투표 전용 액션 섹션 Props
type VoteActionSectionProps = {
  fundingId: number;
};

const VoteActionSection: React.FC< VoteActionSectionProps> = ({
  fundingId,
}) => {
  // Context에서 데이터 가져오기
  const { data: contextData, userId: contextUserId } = useVoteDetailContext();
  const { funding } = contextData;

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

  // 좋아요 토글 mutation
  const likeMutation = useFundingLike();

  // 상세데이터 캐시 조회 (React Query로 최신 상태 유지)
  const { data: detailData } = useFundingDetail({
    fundingId: fundingId.toString(),
    userId,
  });

  // ✅ 화면 중앙 커스텀 알림 문구 (예: "링크가 복사되었습니다")
  const [alertMessage, setAlertMessage] = useState("");

  // ✅ 공유 다이얼로그 열림 여부
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // ✅ 현재 페이지 링크 복사
  const handleCopyLink = async () => {
    try {
      const href = typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(href);
      setAlertMessage("링크가 복사되었습니다.");
      setTimeout(() => setAlertMessage(""), 1500); // 1.5초 뒤 알림 닫기
    } catch {
      setAlertMessage("복사에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setAlertMessage(""), 1500);
    }
  };
  console.log("VoteActionSection userId", userId)

  let currentIsLiked = false; // 현재 좋아요 여부
  let currentLikeCount = 0; // 현재 좋아요 수
  
  if (detailData?.type === 'VOTE') {
    currentIsLiked = detailData.stat.isLiked;
    currentLikeCount = detailData.stat.likeCount;
  }
  

  // ✅ 좋아요 버튼 클릭: 미로그인 방지 + 낙관적 업데이트
  const handleLikeClick = () => {
    if (!userId) {                                                 // 로그인 필요 체크
      alert('로그인 후 이용해주세요.');
      return;
    }
    likeMutation.mutate({
      fundingId,                                                   // 펀딩 식별자
      userId,                                                      // 필수: 서버 API 요구
      isLiked: currentIsLiked,                                     // 현재값 기반 토글
    });
  };

  return (
    <section>
      <div className="flex flex-col pt-5 border-t border-slate-600 gap-4">

        {/* 참여자수 + 남은시간 */}
        <div className="w-full min-w-0 flex items-center justify-between mt-1.5">
          <div className="min-w-0">
            <StatItem icon="people" fill="#2CD8CE" text={`${currentLikeCount}명이 보고 싶어해요`} />
          </div>
          <div className="min-w-0">
            <StatItem icon="time" fill="#2CD8CE" text={`${daysLeft}일 후 종료`} />
          </div>
        </div>
        {/* 🔘 액션 버튼 영역: 좋아요 + 참여하기(결제) */}
        <div className="w-full inline-flex justify-start items-center gap-2">
          {/* 링크 공유 */}
          <Button variant="outline" size="lg" textSize="lg" onClick={() => setShareDialogOpen(true)}>
            <ShareIcon stroke={currentIsLiked ? '#FF5768' : '#94A3B8'} /> {/* 색상 토글 */}
          </Button>

          {/* ❤️ 좋아요 버튼: 낙관적 업데이트로 즉시 반영 */}
          <Button
            variant={currentIsLiked ? "subtle" : "brand2"}       // 좋아요 상태에 따라 variant 변경
            size="lg"                                                // 라지 사이즈
            textSize="lg"                                            // 라지 폰트 (커스텀 prop 가정)
            className="w-full h5-b gap-1"                            // 공통 스타일만 유지
            onClick={handleLikeClick}                                // 클릭 핸들러
            disabled={likeMutation.isPending}                        // 중복 클릭 방지
          >
            {currentIsLiked ? "보고 싶어요 취소" : "나도 보고 싶어요"}
          </Button>
        </div>
      </div>

      {/* ✅ 공유 다이얼로그 */}
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
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  type="text"
                  readOnly
                />
                <Button
                  variant="primary"
                  size="md"
                  className="h-10 px-4 whitespace-nowrap"
                  onClick={handleCopyLink}
                >
                  복사
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ 중앙 띄우는 커스텀 알림 (토스트 대용) */}
      {alertMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
          {/* 어두운 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/80" />
          {/* 알림창 컨텐츠 */}
          <div className="relative bg-BG-2 text-primary px-8 py-6 rounded-2xl shadow-2xl max-w-md w-max text-center animate-in zoom-in-95 duration-200">
            <p className="h6-b">{alertMessage}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export { VoteActionSection };
export type { VoteActionSectionProps };
