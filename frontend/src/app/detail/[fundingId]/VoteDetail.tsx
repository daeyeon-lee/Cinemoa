'use client';

import { useState } from 'react';
import { CineDetailCard } from '@/components/cards/CineDetailCard';
import type { VoteDetailData } from '@/types/fundingDetail';

type Props = {
  data: VoteDetailData; // 투표 상세 데이터
  userId?: string;      // 로그인된 사용자 ID (좋아요용)
};

export default function VoteDetail({ data, userId }: Props) {
  // 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(data.participation.isLike);
  const [likeCount, setLikeCount] = useState(data.participation.likeCount);

  // 좋아요 토글
  const toggleLike = async () => {
    if (!userId) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    // TODO: 실제 API 호출 (POST / DELETE)
  };

  return (
    <section>
      {/* 상단 카드 */}
      <CineDetailCard
        data={data}
        loadingState="ready"
        isLiked={isLiked}
        likeCount={likeCount}
        onPrimaryAction={toggleLike}
      />

      {/* 상세 내용 */}
      <div className="p-6">
        <h2 className="text-xl font-bold">{data.vote.title}</h2>
        <p>{data.vote.content}</p>
        <p>
          투표 기간: {data.vote.fundingStartsOn} ~ {data.vote.fundingEndsOn}
        </p>
      </div>
    </section>
  );
}
