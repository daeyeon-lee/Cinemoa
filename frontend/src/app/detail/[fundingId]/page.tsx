
import { FundingDetail } from '@/app/detail/[fundingId]/FundingDetail';

/**
 * 펀딩/투표 상세 페이지 (React Query 기반)
 * 
 * 기존 SSR 방식에서 React Query 방식으로 변경:
 * - 서버에서 직접 데이터 fetch → 클라이언트에서 React Query 사용
 * - 기존 컴포넌트 구조는 그대로 유지
 */
export default async function DetailPage({
  params,        // URL 파라미터 (예: /detail/123 → { fundingId: '123' })
  searchParams,  // 쿼리 파라미터 (예: ?user_id=5 → { user_id: '5' })
}: {
  params: Promise<{ fundingId: string }>;
  searchParams: Promise<{ user_id?: string | string[] }>;
}) {
  // Promise로 들어온 params와 searchParams를 await 해야 함
  const { fundingId } = await params;
  const sp = await searchParams;

  // user_id는 string | string[] | undefined 일 수 있음 → 안전하게 처리
  const userId =
    typeof sp.user_id === 'string'
      ? sp.user_id
      : Array.isArray(sp.user_id)
      ? sp.user_id[0]
      : undefined;

  // 🎯 기존 FundingDetail 컴포넌트에 fundingId와 userId만 전달
  // 데이터 fetching은 FundingDetail 내부에서 React Query로 처리
  return (
    <FundingDetail 
      fundingId={fundingId}
      userId={userId}
    />
    
    // return data.type === 'funding'
    // ? <FundingDetailCard data={data}/>
    // // ? <FundingDetail data={data} userId={userId} />
    // : <VoteDetail data={data} userId={userId} />;
  );
}