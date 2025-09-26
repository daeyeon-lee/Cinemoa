// 하위 카테고리 타입
export interface ChildCategory {
  categoryId: number;
  categoryName: string;
}

// 상위 카테고리 타입
export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  childCategories: ChildCategory[];
}
