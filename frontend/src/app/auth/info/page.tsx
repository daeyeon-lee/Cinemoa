'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// 카테고리 데이터(더미데이터)
const categories = {
  movie: {
    title: '영화',
    icon: '🎬',
    items: ['액션', '음악', '판타지/SF', '애니메이션', '기타'],
  },
  series: {
    title: '시리즈',
    icon: '▶️',
    items: ['액션', '음악', '판타지/SF', '애니메이션', '기타'],
  },
  performance: {
    title: '공연',
    icon: '🎤',
    items: ['K-POP', 'POP', '클래식', '뮤지컬', '기타'],
  },
  sports: {
    title: '스포츠중계',
    icon: '⚽',
    items: ['축구', '야구', 'F1', 'E-스포츠', '기타'],
  },
};

export default function InfoPage() {
  const [selectedCategories, setSelectedCategories] = useState<{
    movie: string[];
    series: string[];
    performance: string[];
    sports: string[];
  }>({
    movie: [],
    series: [],
    performance: [],
    sports: [],
  });

  const handleCategorySelect = (categoryKey: string, item: string) => {
    setSelectedCategories((prev) => {
      const currentCategory = prev[categoryKey as keyof typeof prev];

      if (currentCategory.includes(item)) {
        // 이미 선택된 경우 제거
        return {
          ...prev,
          [categoryKey]: currentCategory.filter((c) => c !== item),
        };
      } else if (currentCategory.length < 3) {
        // 3개 미만인 경우 추가
        return {
          ...prev,
          [categoryKey]: [...currentCategory, item],
        };
      }
      return prev; // 3개 이상이면 변경 없음
    });
  };

  return (
    <div className="max-w-md mx-auto my-auto">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-h3-b mb-2">필수 정보 입력하기</h1>
      </div>
      <div className="mt-10 mb-8 border-b border-stroke-4">
        <h2 className="text-h5-b mb-1">선호 카테고리 선택하기</h2>
        <p className="text-p3 text-tertiary pb-2">최대 3개까지 선택해주세요.</p>
      </div>

      {/* 카테고리 섹션들 */}
      <div className="space-y-6">
        {Object.entries(categories).map(([key, category]) => (
          <div key={key}>
            <div className="flex items-center mb-2">
              <span className="text-p3-b mr-2">{category.icon}</span>
              <h3 className="text-p2-b text-Brand1-Primary">{category.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2  ">
              {category.items.map((item) => {
                const isSelected = selectedCategories[key as keyof typeof selectedCategories].includes(item);
                return (
                  <Button
                    variant="outline"
                    key={item}
                    size="sm"
                    onClick={() => handleCategorySelect(key, item)}
                    disabled={!isSelected && selectedCategories[key as keyof typeof selectedCategories].length >= 3}
                  >
                    {item}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 카테고리 표시 */}
      {Object.values(selectedCategories).some((category) => category.length > 0) && (
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            선택된 카테고리 ({Object.values(selectedCategories).flat().length}/3)
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(selectedCategories)
              .flat()
              .map((category) => (
                <span key={category} className="bg-Brand1-Strong text-white px-3 py-1 rounded-full text-xs">
                  {category}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* 다음 단계 버튼 */}
      <div className="mt-8">
        <Button
          disabled={Object.values(selectedCategories).flat().length === 0}
          size="lg"
          variant={`${Object.values(selectedCategories).flat().length >= 3 ? 'brand1' : 'secondary'}`}
          className={`w-full ${
            Object.values(selectedCategories).flat().length >= 3 ? 'text-primary' : 'text-tertiary'
          }`}
        >
          다음 단계 &gt;
        </Button>
      </div>
    </div>
  );
}
