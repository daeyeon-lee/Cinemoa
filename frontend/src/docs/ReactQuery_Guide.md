# React Query 펀딩 데이터 관리 가이드

영화관 대관 펀딩 서비스에서 React Query를 사용한 데이터 관리 및 동기화 구현 가이드입니다.

## 📁 폴더 구조

```
frontend/src/
├── api/
│   ├── funding.ts              # 기존 펀딩 생성 API (수정하지 않음)
│   └── fundingDetail.ts        # 새로 추가된 조회 전용 API
├── hooks/
│   └── queries/
│       ├── index.ts            # 모든 훅 통합 export
│       ├── useFundings.ts      # 펀딩 리스트 조회 (무한 스크롤)
│       ├── useFundingDetail.ts # 펀딩 상세 조회
│       └── useFundingActions.ts # 좋아요/참여 액션 관리
├── components/
│   └── demo/
│       └── FundingQueryDemo.tsx # React Query 사용 예시 컴포넌트
└── app/detail/[fundingId]/
    └── FundingDetailWithQuery.tsx # React Query 기반 상세 페이지
```

## 🚀 주요 기능

### 1. 데이터 동기화
- **리스트 ↔ 상세 간 실시간 동기화**: 상세 페이지에서 좋아요를 누르면 리스트에도 즉시 반영
- **Optimistic Updates**: 좋아요 토글 시 서버 응답을 기다리지 않고 즉시 UI 업데이트
- **캐시 관리**: 동일한 데이터는 캐시에서 재사용하여 불필요한 API 호출 방지

### 2. 사용자별 개인화 정보
- **userId 기반 데이터**: `isLiked`, `likeCount`, `isParticipated` 정보 관리
- **참여 상태 별도 조회**: 리스트에서 제공되지 않는 `isParticipated` 정보를 상세 페이지에서 추가 조회

### 3. 성능 최적화
- **무한 스크롤**: 대량의 펀딩 리스트를 효율적으로 로드
- **Stale Time**: 데이터 신선도 관리로 불필요한 재조회 방지
- **Error Retry**: 네트워크 오류 시 자동 재시도

## 📖 사용법

### 1. 기본 셋업

React Query Provider가 이미 설정되어 있습니다:
```tsx
// frontend/src/providers/QueryProvider.tsx
// 이미 layout.tsx에 적용됨
```

### 2. 펀딩 리스트 조회

```tsx
import { useFundings, useFundingLike } from '@/hooks/queries';

function FundingListPage() {
  // 무한 스크롤 리스트 조회
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useFundings({
    type: 'funding',
    category: '영화',
    region: '중구',
    sortBy: 'latest',
    size: 20
  });

  // 좋아요 토글
  const likeMutation = useFundingLike();

  const items = data?.items || [];

  const handleLikeClick = (fundingId: number, isLiked: boolean) => {
    likeMutation.mutate({
      fundingId,
      userId: '사용자ID',
      isLiked
    });
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <button onClick={() => handleLikeClick(item.id, item.isLiked)}>
            {item.isLiked ? '💖' : '🤍'} {item.favoriteCount}
          </button>
        </div>
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          더 보기
        </button>
      )}
    </div>
  );
}
```

### 3. 펀딩 상세 조회

```tsx
import { useFundingDetail, useFundingLike, useFundingParticipation } from '@/hooks/queries';

function FundingDetailPage({ fundingId }: { fundingId: string }) {
  const userId = '사용자ID'; // 실제로는 auth store에서 가져옴

  // 상세 정보 조회
  const { data, isLoading, error } = useFundingDetail({
    fundingId,
    userId
  });

  // 참여 상태 조회 (isParticipated 정보)
  const { data: participationData } = useFundingParticipation(
    data?.type === 'funding' ? data.funding.fundingId : 0,
    userId
  );

  // 좋아요 토글
  const likeMutation = useFundingLike();

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (!data || data.type !== 'funding') return <div>데이터 없음</div>;

  return (
    <div>
      <h1>{data.funding.title}</h1>
      <p>좋아요: {data.stat.likeCount}</p>
      <p>참여 여부: {participationData?.isParticipated ? '참여함' : '미참여'}</p>
      
      <button
        onClick={() => likeMutation.mutate({
          fundingId: data.funding.fundingId,
          userId,
          isLiked: data.stat.isLiked
        })}
      >
        {data.stat.isLiked ? '좋아요 취소' : '좋아요'}
      </button>
    </div>
  );
}
```

### 4. 기존 페이지에서 사용하기

기존 상세 페이지(`/detail/[fundingId]/page.tsx`)는 React Query를 사용하도록 업데이트되었습니다:

```tsx
// 환경변수로 제어 가능
const useReactQuery = process.env.NEXT_PUBLIC_USE_REACT_QUERY === 'true' || true;

if (useReactQuery) {
  return <FundingDetailWithQuery fundingId={fundingId} initialData={data} />;
} else {
  return <FundingDetail data={data} />; // 기존 컴포넌트
}
```

## 🔧 API 구조

### 조회 API (신규 추가)
```typescript
// frontend/src/api/fundingDetail.ts

// 펀딩 리스트 조회
getFundingList(params: QueryParams)

// 펀딩 상세 조회 (userId 포함 시 개인화 정보 포함)
getFundingDetail(fundingId: string, userId?: string)

// 좋아요 토글
toggleFundingLike(fundingId: number, userId: string, isLiked: boolean)

// 참여 상태 조회
getFundingParticipation(fundingId: number, userId: string)
```

### React Query 훅
```typescript
// frontend/src/hooks/queries/

// 리스트 조회 (무한 스크롤)
useFundings(params?: UseFundingsParams)

// 상세 조회
useFundingDetail({ fundingId, userId })

// 좋아요 액션
useFundingLike()

// 참여 상태 조회
useFundingParticipation(fundingId, userId)
```

## 💾 캐시 키 구조

```typescript
// 리스트 캐시
['fundings', { type: 'funding', category: '영화', region: '서울시', sortBy: 'latest' }]

// 상세 캐시 (사용자별)
['funding', '123', 'userId456']

// 참여 상태 캐시
['funding', 123, 'participation', 'userId456']
```

## 🔄 데이터 동기화 원리

1. **좋아요 토글 시**:
   ```typescript
   // 1. Optimistic Update로 즉시 UI 반영
   queryClient.setQueryData(['funding', fundingId, userId], newData);
   
   // 2. 리스트 캐시도 함께 업데이트
   queryClient.setQueriesData(['fundings'], updateListCache);
   
   // 3. 서버 요청 수행
   // 4. 성공/실패 시 최종 refetch
   ```

2. **리스트 ↔ 상세 동기화**:
   - 동일한 fundingId에 대한 모든 캐시가 연결됨
   - 한 곳에서 데이터 변경 시 모든 관련 캐시 자동 업데이트

## 🚀 성능 최적화 팁

1. **Stale Time 설정**:
   - 리스트: 1분 (빈번한 변경)
   - 상세: 30초 (실시간성 중요)
   - 참여 상태: 1분 (상대적으로 안정적)

2. **선택적 쿼리 실행**:
   ```typescript
   enabled: !!userId && !!fundingId // 필요한 데이터가 있을 때만 실행
   ```

3. **Optimistic Updates**:
   - 좋아요 같은 즉각적인 반응이 필요한 액션에 사용
   - 에러 시 자동 롤백

## 🎯 주의사항

1. **기존 API 보존**: `frontend/src/api/funding.ts`는 펀딩 생성용이므로 수정하지 않음
2. **사용자 인증**: `userId`가 없으면 개인화 정보 조회 불가
3. **에러 처리**: 네트워크 오류, 권한 오류 등에 대한 적절한 fallback 제공
4. **캐시 무효화**: 데이터 변경 후 관련 캐시 적절히 무효화

## 🔍 데모 및 테스트

데모 컴포넌트를 통해 실제 동작을 확인할 수 있습니다:

```tsx
import FundingQueryDemo from '@/components/demo/FundingQueryDemo';

// 사용법
<FundingQueryDemo userId="123" />
```

이 컴포넌트는 리스트 조회, 상세 조회, 좋아요 토글의 모든 기능을 포함하며 실시간 동기화를 확인할 수 있습니다.

---

## 다음 단계

1. **실제 API 엔드포인트 확인**: 백엔드 팀과 API 응답 구조 확인
2. **에러 메시지 다국화**: 사용자 친화적인 에러 메시지 제공
3. **성능 모니터링**: React Query DevTools로 캐시 상태 모니터링
4. **테스트 코드 작성**: 중요한 데이터 플로우에 대한 테스트 추가
