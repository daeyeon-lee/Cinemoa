import { ComponentType } from 'react';
import { HeartIcon } from '@/component/icon/heartIcon';

export const CATEGORY_VALUES = {
  ALL: 'all',
  MOVIE: 'movie',
  SERIES: 'series',
  PERFORMANCE: 'performance',
  SPORTS: 'sports',
} as const;

export type CategoryValue = (typeof CATEGORY_VALUES)[keyof typeof CATEGORY_VALUES];

export interface SubCategoryItem {
  categoryId: number;
  categoryName: string;
}

export interface CategoryInfo {
  categoryId: number | null;
  label: string;
  icon: ComponentType<any> | null;
  items: SubCategoryItem[];
}

export interface Category {
  categoryId: number | null;
  label: string;
  icon: ComponentType<any> | null;
  value: CategoryValue;
  items?: SubCategoryItem[];
}

// 카테고리 정보 정의 (백엔드 API 구조 반영)
export const CATEGORIES_INFO: Record<CategoryValue, CategoryInfo> = {
  [CATEGORY_VALUES.ALL]: {
    categoryId: null,
    label: '전체',
    icon: null,
    items: [],
  },
  [CATEGORY_VALUES.MOVIE]: {
    categoryId: 1,
    label: '영화',
    icon: HeartIcon,
    items: [
      { categoryId: 5, categoryName: '액션' },
      { categoryId: 6, categoryName: '공포/스릴러' },
      { categoryId: 7, categoryName: '음악' },
      { categoryId: 8, categoryName: '판타지/SF' },
      { categoryId: 9, categoryName: '애니메이션' },
      { categoryId: 10, categoryName: '기타' },
    ],
  },
  [CATEGORY_VALUES.SERIES]: {
    categoryId: 2,
    label: '시리즈',
    icon: HeartIcon,
    items: [
      { categoryId: 11, categoryName: '액션' },
      { categoryId: 12, categoryName: '공포/스릴러' },
      { categoryId: 13, categoryName: '음악' },
      { categoryId: 14, categoryName: '판타지/SF' },
      { categoryId: 15, categoryName: '애니메이션' },
      { categoryId: 16, categoryName: '기타' },
    ],
  },
  [CATEGORY_VALUES.PERFORMANCE]: {
    categoryId: 3,
    label: '공연',
    icon: HeartIcon,
    items: [
      { categoryId: 17, categoryName: '외국가수' },
      { categoryId: 18, categoryName: '한국가수' },
      { categoryId: 19, categoryName: '클래식' },
      { categoryId: 20, categoryName: '뮤지컬' },
      { categoryId: 21, categoryName: '기타' },
    ],
  },
  [CATEGORY_VALUES.SPORTS]: {
    categoryId: 4,
    label: '스포츠중계',
    icon: HeartIcon,
    items: [
      { categoryId: 22, categoryName: '축구' },
      { categoryId: 23, categoryName: '야구' },
      { categoryId: 24, categoryName: 'F1' },
      { categoryId: 25, categoryName: 'e스포츠' },
      { categoryId: 26, categoryName: '기타' },
    ],
  },
};

// 홈페이지용 카테고리 (전체 제외)
export const HOME_CATEGORIES: Category[] = [
  CATEGORY_VALUES.MOVIE,
  CATEGORY_VALUES.SERIES,
  CATEGORY_VALUES.PERFORMANCE,
  CATEGORY_VALUES.SPORTS,
].map((value) => ({
  categoryId: CATEGORIES_INFO[value].categoryId,
  label: CATEGORIES_INFO[value].label,
  icon: CATEGORIES_INFO[value].icon,
  value,
  items: CATEGORIES_INFO[value].items,
}));

// 일반 페이지용 카테고리 (전체 포함)
export const STANDARD_CATEGORIES: Category[] = [
  CATEGORY_VALUES.ALL,
  CATEGORY_VALUES.MOVIE,
  CATEGORY_VALUES.SERIES,
  CATEGORY_VALUES.PERFORMANCE,
  CATEGORY_VALUES.SPORTS,
].map((value) => ({
  categoryId: CATEGORIES_INFO[value].categoryId,
  label: CATEGORIES_INFO[value].label,
  icon: CATEGORIES_INFO[value].icon,
  value,
  items: CATEGORIES_INFO[value].items,
}));

// 카테고리 값으로 카테고리 정보 찾기
export const findCategoryByValue = (value: CategoryValue): Category | undefined => {
  return STANDARD_CATEGORIES.find((category) => category.value === value);
};

// 카테고리 라벨로 카테고리 정보 찾기
export const findCategoryByLabel = (label: string): Category | undefined => {
  return STANDARD_CATEGORIES.find((category) => category.label === label);
};

// 특정 카테고리의 서브 아이템들 가져오기
export const getCategoryItems = (value: CategoryValue): SubCategoryItem[] => {
  return CATEGORIES_INFO[value]?.items || [];
};

// categoryId로 CategoryValue 찾기
export const findCategoryValueById = (categoryId: number): CategoryValue | null => {
  for (const [key, info] of Object.entries(CATEGORIES_INFO)) {
    if (info.categoryId === categoryId) {
      return key as CategoryValue;
    }
  }
  return null;
};

// categoryId로 서브카테고리 찾기
export const findSubCategoryById = (categoryId: number): SubCategoryItem | null => {
  for (const categoryInfo of Object.values(CATEGORIES_INFO)) {
    const subCategory = categoryInfo.items.find((item) => item.categoryId === categoryId);
    if (subCategory) {
      return subCategory;
    }
  }
  return null;
};
