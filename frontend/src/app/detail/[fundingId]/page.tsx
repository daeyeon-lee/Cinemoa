// app/detail/[fundingId]/page.tsx

// 펀딩 상세/투표 상세 전용 컴포넌트
import { FundingDetailCard } from '@/components/cards/detail/FundingDetailCard';
import type { FundingDetailData } from '@/types/detail';

import FundingDetail from './FundingDetail';
import VoteDetail from './VoteDetail';

// API 응답 타입 정의
import type { ApiResponse, DetailData } from '@/types/detail';
import FundingDetailInfo from '@/components/cards/detail/FundingDetailInfo';

// API 서버 주소 (환경변수에서 관리)
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// 동적 라우팅된 상세 페이지
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

  // user_id 있으면 쿼리스트링 추가
  const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : '';


  // 서버에서 상세 데이터 가져오기
  const res = await fetch(`${API_BASE_URL}funding/${fundingId}${qs}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store', // SSR에서 항상 fresh 데이터
  });

  console.log('res:', res);

  // HTTP 에러 처리
  if (!res.ok) return <div>HTTP {res.status}</div>;

  // 응답 JSON 파싱
  const json = (await res.json()) as ApiResponse<DetailData>;

  // API 응답 확인
  if (json.state !== 'SUCCESS' || !json.data) return <div>{json.message}</div>;

  const data = json.data;

  console.log(data);
   

  // type에 따라 다른 컴포넌트 렌더링
  return (
    // <FundingDetailCard data={data as FundingDetailData}/>
    <FundingDetailInfo data={data as FundingDetailData}/>)


    // return data.type === 'funding'
    // ? <FundingDetailCard data={data}/>
    // // ? <FundingDetail data={data} userId={userId} />
    // : <VoteDetail data={data} userId={userId} />;
}