
import { FundingDetail } from '@/app/(main)/detail/[fundingId]/FundingDetail';

/**
 * 펀딩/투표 상세 페이지 (React Query 기반)
 * 
 * 일단 펀딩만 랜더하도록 구현
 * 추후 펀딩/투표 분기 처리 하도록 수정 필요.
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