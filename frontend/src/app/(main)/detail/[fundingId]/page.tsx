
import { DetailRenderer } from './DetailRenderer';

/**
 * 펀딩/투표 상세 페이지 (React Query 기반)
 * 
 * type이 FUNDING/VOTE에 따라 적절한 컴포넌트를 렌더링
 */
export default async function DetailPage({
  params,        // URL 파라미터 (fundingId)
  searchParams,  // 쿼리 파라미터 (userId)
}: {
  params: Promise<{ fundingId: string }>;
  searchParams: Promise<{ userId?: string | string[] }>;
}) {
  // Promise로 들어온 params와 searchParams를 await 해야 함
  const { fundingId } = await params;
  const sp = await searchParams;

  // user_id는 string | string[] | undefined 일 수 있음 → 안전하게 처리
  const userId =
      typeof sp.userId === 'string'
      ? sp.userId
      : Array.isArray(sp.userId)
      ? sp.userId[0]
      : undefined;

  // 🎯 DetailPageWrapper에서 데이터를 조회하고 타입에 따라 분기 처리
  return (
    <DetailRenderer 
      fundingId={fundingId}
      userId={userId}
    />
  );
}