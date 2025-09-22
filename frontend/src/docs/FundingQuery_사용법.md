# 펀딩 React Query 사용법 가이드

기존 코드를 건드리지 않고 새로 추가된 React Query 기반 펀딩 상태관리 사용법입니다.

## 📁 추가된 파일들

```
frontend/src/
├── api/fundingQuery.ts                    # 조회 전용 API
├── hooks/queries/
│   ├── useFunding.ts                      # 메인 훅들
│   └── index.ts                           # export 파일
├── components/examples/FundingWithQuery.tsx  # 사용 예시
└── docs/FundingQuery_사용법.md             # 이 문서
```

## 🚀 기본 사용법

### 1단계: 훅 import
```typescript
import { useFundingList, useFundingDetail, useFundingLike } from '@/hooks/queries';
```

### 2단계: 목록 페이지에서 사용
```typescript
function YourListPage() {
  // 목록 조회 (무한 스크롤)
  const { data, fetchNextPage, hasNextPage } = useFundingList({
    category: '영화',
    region: '서울시'
  });

  // 좋아요 토글
  const likeMutation = useFundingLike();

  const items = data?.items || [];

  // 좋아요 클릭
  const handleLike = (fundingId, isLiked) => {
    likeMutation.mutate({
      fundingId,
      userId: 'yourUserId', // auth store에서 가져오세요
      isLiked
    });
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <button onClick={() => handleLike(item.id, item.isLiked)}>
            {item.isLiked ? '❤️' : '🤍'} {item.likeCount}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3단계: 상세 페이지에서 사용
```typescript
function YourDetailPage({ fundingId }) {
  // 상세 조회 (isParticipated 포함)
  const { data } = useFundingDetail({ 
    fundingId, 
    userId: 'yourUserId' 
  });

  // 좋아요 토글 (목록과 자동 동기화!)
  const likeMutation = useFundingLike();

  if (!data || data.type !== 'funding') return null;

  return (
    <div>
      <h1>{data.funding.title}</h1>
      <p>좋아요: {data.stat.likeCount}</p>
      <p>참여 여부: {data.stat.isParticipated ? '참여함' : '미참여'}</p>
      
      <button onClick={() => likeMutation.mutate({
        fundingId: data.funding.fundingId,
        userId: 'yourUserId',
        isLiked: data.stat.isLiked
      })}>
        좋아요 토글
      </button>
    </div>
  );
}
```

## 🔄 데이터 동기화 원리

### 공통 정보 동기화
- **isLiked**: 목록 ↔ 상세 자동 동기화
- **likeCount**: 목록 ↔ 상세 자동 동기화

### 상세 전용 정보 보존
- **isParticipated**: 상세에서만 사용, 목록 동기화 시 건드리지 않음

### 동작 과정
```
1. 목록에서 좋아요 클릭
2. 즉시 UI 업데이트 (Optimistic Update)
3. 서버에 API 요청
4. 성공하면 → 상세 페이지 캐시도 자동 업데이트
5. 실패하면 → 자동 롤백
```

## 📋 API 응답 구조 차이 해결

### 목록 응답 (isParticipated 없음)
```typescript
{
  data: {
    content: [
      {
        fundingId: 123,
        title: "영화 펀딩",
        isLiked: true,
        likeCount: 50
        // isParticipated 없음
      }
    ]
  }
}
```

### 상세 응답 (isParticipated 포함)
```typescript
{
  data: {
    type: 'funding',
    funding: { fundingId: 123, title: "영화 펀딩" },
    stat: {
      isLiked: true,
      likeCount: 50,
      isParticipated: true  // 추가 정보
    }
  }
}
```

### 해결 방법
✅ **공통 정보만 동기화**: isLiked, likeCount  
✅ **상세 정보 보존**: isParticipated는 건드리지 않음

## ⚠️ 주의사항

1. **기존 코드와 함께 사용 가능**: 새로운 훅을 점진적으로 도입
2. **userId 필수**: 개인화 정보 조회 시 필요
3. **API 응답 구조 확인**: 실제 API 응답에 맞게 코드 조정 필요

## 🛠️ 실제 적용 방법

### 기존 페이지 점진적 교체
```typescript
// 기존 컴포넌트와 병행 사용
function YourPage() {
  const useNewQuery = true; // 환경변수나 조건으로 제어

  if (useNewQuery) {
    return <FundingWithQueryComponent />; // 새로운 방식
  } else {
    return <ExistingComponent />;         // 기존 방식
  }
}
```

### auth store와 연동
```typescript
import { useAuthStore } from '@/stores/authStore';

function Component() {
  const { user } = useAuthStore();
  const userId = user?.id?.toString();

  const { data } = useFundingDetail({ fundingId, userId });
  // ...
}
```

## 🎯 기대 효과

✅ **실시간 동기화**: 리스트 ↔ 상세 간 좋아요 상태 자동 반영  
✅ **성능 향상**: 캐시 기반 데이터 재사용  
✅ **UX 개선**: Optimistic Updates로 즉각적인 반응  
✅ **안정성**: 에러 시 자동 롤백  

이제 기존 코드를 건드리지 않고도 React Query의 강력한 상태관리를 사용할 수 있습니다! 🚀
