import { useEffect, useRef } from 'react';

/**
 * 무한스크롤을 위한 Intersection Observer 커스텀 훅
 *
 * 사용자가 페이지 하단 근처에 도달하면 자동으로 다음 데이터를 로드합니다.
 * 기존의 "더보기" 버튼을 클릭하는 방식보다 더 자연스러운 UX를 제공합니다.
 *
 * @param callback - 사용자가 하단에 도달했을 때 실행할 함수 (보통 fetchNextPage)
 * @param hasNextPage - 서버에서 더 가져올 데이터가 있는지 여부
 * @param isLoading - 현재 데이터를 로딩 중인지 여부 (로딩 중에는 중복 요청 방지)
 * @param threshold - 얼마나 화면에 보여야 트리거할지 (0.1 = 10% 보이면 트리거)
 * @returns observerRef - 감시할 DOM 요소에 연결할 ref (보통 목록 마지막에 배치)
 *
 * @example
 * ```tsx
 * // 사용 예시
 * const observerRef = useInfiniteScroll(
 *   fetchNextPage,  // 다음 페이지를 가져오는 함수
 *   hasNextPage,    // 더 가져올 데이터가 있는지
 *   isFetchingNextPage,  // 현재 로딩 중인지
 *   0.1  // 10% 정도 보이면 트리거
 * );
 *
 * return (
 *   <div>
 *     {items.map(item => <Card key={item.id} data={item} />)}
 *     // 이 div가 화면에 보이면 자동으로 다음 페이지 로드
 *     <div ref={observerRef} />
 *   </div>
 * );
 * ```
 */
export const useInfiniteScroll = (
  callback: () => void,
  hasNextPage: boolean,
  isLoading: boolean,
  threshold: number = 0.1
) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 감시할 요소가 없거나, 더 이상 가져올 데이터가 없거나, 이미 로딩 중이면 아무것도 하지 않음
    if (!observerRef.current || !hasNextPage || isLoading) return;

    // Intersection Observer 생성 - 요소가 화면에 보이는지 감시
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 감시 중인 요소가 화면에 보이면 (threshold 만큼)
        if (entry.isIntersecting) {
          console.log('📋 [useInfiniteScroll] 사용자가 하단에 도달 - 다음 페이지 로드 시작');
          callback(); // 다음 페이지 로드 함수 실행
        }
      },
      {
        threshold // 요소가 얼마나 보여야 트리거할지 (0.1 = 10%)
      }
    );

    // 실제 DOM 요소 감시 시작
    observer.observe(observerRef.current);

    // 컴포넌트가 언마운트되거나 의존성이 변경되면 감시 중단
    return () => {
      observer.disconnect();
    };
  }, [callback, hasNextPage, isLoading, threshold]);

  return observerRef;
};