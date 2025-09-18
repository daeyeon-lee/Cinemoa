'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import MovieIcon from '@/component/icon/movieIcon';
import SeriesIcon from '@/component/icon/seriesIcon';
import ConcertIcon from '@/component/icon/concertIcon';
import SportsIcon from '@/component/icon/sportsIcon';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

// 카테고리 데이터(더미데이터)
const categories = {
  movie: {
    title: '영화',
    icon: MovieIcon,
    items: ['액션', '음악', '판타지/SF', '애니메이션', '기타'],
  },
  series: {
    title: '시리즈',
    icon: SeriesIcon,
    items: ['액션', '음악', '판타지/SF', '애니메이션', '기타'],
  },
  performance: {
    title: '공연',
    icon: ConcertIcon,
    items: ['K-POP', 'POP', '클래식', '뮤지컬', '기타'],
  },
  sports: {
    title: '스포츠중계',
    icon: SportsIcon,
    items: ['축구', '야구', 'F1', 'E-스포츠', '기타'],
  },
};

export default function Step1Page() {
  const router = useRouter();
  const { updateUserInfo } = useAuthStore();
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
    setSelectedCategories((prev: any) => {
      const currentCategory = prev[categoryKey as keyof typeof prev];

      if (currentCategory.includes(item)) {
        // 이미 선택된 경우 제거
        return {
          ...prev,
          [categoryKey]: currentCategory.filter((c: any) => c !== item),
        };
      } else if (currentCategory.length < 3) {
        // 3개 미만인 경우 추가
        return {
          ...prev,
          [categoryKey]: [...currentCategory, item as string],
        };
      }
      return prev; // 3개 이상이면 변경 없음
    });
  };

  const isAllCategoriesSelected = Object.values(selectedCategories).every((category) => category.length > 0);

  const handleNextStep = () => {
    // 선택한 카테고리 정보를 사용자 정보에 저장
    updateUserInfo({ 
      preferences: selectedCategories 
    });
    // 다음 단계로 이동
    router.push('/auth/info/step2');
  };

  return (
    <div className="w-max mx-auto px-4 py-8 sm:py-12">
      {/* 헤더 */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-h3-b mb-2">필수 정보 입력하기</h1>
      </div>
      <div className="mt-6 sm:mt-10 mb-6 sm:mb-8 border-b border-stroke-4">
        <h2 className="text-h5-b mb-1">선호 카테고리 선택하기</h2>
        <p className="text-xs sm:text-p3 text-tertiary pb-2"> 각 카테고리별로 최대 3개까지 선택해주세요.</p>
      </div>

      {/* 카테고리 섹션들 */}
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(categories).map(([key, category]) => (
          <div key={key}>
            <div className="flex items-center mb-2">
              <category.icon className="w-4 h-4 mr-1" />
              <h3 className="text-sm sm:text-p2-b text-Brand1-Primary">{category.title}</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-1">
              {category.items.map((item) => {
                const isSelected = selectedCategories[key as keyof typeof selectedCategories].includes(item as string);
                const isDisabled =
                  !isSelected && selectedCategories[key as keyof typeof selectedCategories].length >= 3;
                return (
                  <Button
                    variant="outline"
                    key={item}
                    size="sm"
                    textSize="sm"
                    onClick={() => handleCategorySelect(key, item)}
                    disabled={isDisabled}
                    className={`w-full rounded-[6px] max-sm:text-xs ${
                      isSelected
                        ? 'text-Brand1-Strong border-Brand1-Strong hover:border-Brand1-Secondary'
                        : isDisabled
                        ? 'text-tertiary border-stroke-4 opacity-50 cursor-not-allowed'
                        : 'text-tertiary border-stroke-4 hover:border-stroke-2'
                    }`}
                  >
                    {item}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 다음 단계 버튼 */}
      <div className="mt-6 sm:mt-8">
        <Button
          onClick={handleNextStep}
          disabled={!isAllCategoriesSelected}
          size="lg"
          variant={isAllCategoriesSelected ? 'brand1' : 'secondary'}
          className={`w-full text-h6-b ${isAllCategoriesSelected ? 'text-primary' : 'text-tertiary'}`}
        >
          다음 단계 &gt;
        </Button>
      </div>
    </div>
  );
}
