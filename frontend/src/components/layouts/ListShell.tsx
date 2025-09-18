import React from 'react';

/**
 * 목록 조회 페이지의 기본 레이아웃 컴포넌트
 * 둘러보기/이거어때/검색 등의 페이지에서 사용하는 공통 틀
 */
interface ListShellProps {
  /** 상단 필터/정렬 바 영역에 렌더링할 컴포넌트 */
  header: React.ReactNode;
  /** 좌측 보조 필터 영역에 렌더링할 컴포넌트 */
  sidebar: React.ReactNode;
  /** 우측 메인 콘텐츠 영역에 렌더링할 컴포넌트 (카드 리스트 등) */
  content: React.ReactNode;
}

/**
 * ListShell 컴포넌트
 *
 * @description 목록 조회 페이지의 기본 레이아웃을 제공합니다.
 * - 상단: 필터/정렬 바
 * - 하단 좌측: 보조 필터 (200px 고정)
 * - 하단 우측: 메인 콘텐츠 (최대 920px, 총 컨테이너 1200px)
 *
 * @param props.header - 상단 필터바에 표시할 컴포넌트
 * @param props.sidebar - 좌측 사이드바에 표시할 컴포넌트
 * @param props.content - 메인 콘텐츠 영역에 표시할 컴포넌트
 */
const ListShell: React.FC<ListShellProps> = ({ header, sidebar, content }) => {
  return (
    <div className="min-h-screen mt-16">
      {/* 상단 필터바 영역 */}
      <div className="w-full pb-7">{header}</div>

      {/* 하단 메인 컨테이너 */}
      <div className="flex justify-between max-w-full mx-auto">
        {/* 좌측 보조 필터 영역 (데스크톱: 200px 고정) */}
        {/* 초기화 버튼에 아이콘 추가! */}
        <div className="w-56 flex-shrink-0">{sidebar}</div>

        {/* 우측 콘텐츠 영역 (최대 920px) */}
        <div className="flex-1 max-w-[920px]">{content}</div>
      </div>
    </div>
  );
};

export { ListShell };
