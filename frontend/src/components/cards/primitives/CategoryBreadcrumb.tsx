import React from 'react';

// 1차 카테고리 (고정)
type PrimaryCategory = '영화' | '시리즈' | '중계' | '공연';

type CategoryBreadcrumbProps = {
  categoryId?: number;
  primaryCategory?: PrimaryCategory;
  secondaryCategory?: string;
};

// 임시 카테고리 매핑 (API 정해지기 전)
const temporaryCategoryMap: Record<number, { primary: PrimaryCategory; secondary: string }> = {
  // 영화 카테고리 (1-99)
  1: { primary: '영화', secondary: '액션' },
  2: { primary: '영화', secondary: '애니메이션' },
  3: { primary: '영화', secondary: '드라마' },
  4: { primary: '영화', secondary: '코미디' },
  5: { primary: '영화', secondary: '스릴러' },
  
  // 시리즈 카테고리 (100-199)  
  100: { primary: '시리즈', secondary: '드라마' },
  101: { primary: '시리즈', secondary: '예능' },
  102: { primary: '시리즈', secondary: '애니메이션' },
  
  // 중계 카테고리 (200-299)
  200: { primary: '중계', secondary: '스포츠' },
  201: { primary: '중계', secondary: '음악' },
  202: { primary: '중계', secondary: '문화' },
  
  // 공연 카테고리 (300-399)
  300: { primary: '공연', secondary: '뮤지컬' },
  301: { primary: '공연', secondary: '연극' },
  302: { primary: '공연', secondary: '콘서트' },
};

const getCategoryFromId = (categoryId: number): string => {
  const category = temporaryCategoryMap[categoryId];
  return category ? `${category.primary} > ${category.secondary}` : '영화 > 기타';
};

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  categoryId,
  primaryCategory,
  secondaryCategory
}) => {
  const getCategoryDisplay = (): string => {
    // 방법 1: 직접 전달받은 경우
    if (primaryCategory && secondaryCategory) {
      return `${primaryCategory} > ${secondaryCategory}`;
    }
    
    // 방법 2: categoryId를 통한 매핑 (임시)
    if (categoryId) {
      return getCategoryFromId(categoryId);
    }
    
    // 기본값
    return '영화 > 기타';
  };
  
  return (
    <div className="text-gray-400 text-base font-normal font-['Pretendard'] leading-normal">
      {getCategoryDisplay()}
    </div>
  );
};

export { CategoryBreadcrumb };
export type { CategoryBreadcrumbProps, PrimaryCategory };