'use client';

import { useState } from 'react';
import { CineDetailCard } from '@/components/cards/CineDetailCard';
import type { FundingDetailData } from '@/types/detail';

type Props = {
  data: FundingDetailData; // 펀딩 상세 데이터
  userId?: string;         // 로그인된 사용자 ID (좋아요용)
};

export default function FundingDetail({ data, userId }: Props) {
  // 좋아요 상태 관리 (초기값은 서버 응답 기반)
  const [isLiked, setIsLiked] = useState(data.stat.isLiked);
  const [likeCount, setLikeCount] = useState(data.stat.likeCount);

  // 좋아요 토글
  const toggleLike = async () => {
    if (!userId) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    // 낙관적 업데이트
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
        <h2 className="text-xl font-bold">{data.funding.title}</h2>
        <p>{data.funding.content}</p>
        <p>달성률: {data.funding.progressRate}%</p>
        <p>가격: {data.funding.price.toLocaleString()}원</p>
        <p>마감일: {data.funding.fundingEndsOn}</p>
      </div>
    </section>
  );
}
