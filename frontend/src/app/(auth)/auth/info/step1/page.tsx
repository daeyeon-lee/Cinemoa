'use client';
import { Button } from '@/components/ui/button';
import OutlinedButton from '@/components/buttons/OutlinedButton';
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
    items: ['액션', '공포/스릴러', '음악', '판타지/SF', '애니메이션', '기타'],
  },
  series: {
    title: '시리즈',
    icon: SeriesIcon,
    items: ['액션', '공포/스릴러', '음악', '판타지/SF', '애니메이션', '기타'],
  },
  performance: {
    title: '공연',
    icon: ConcertIcon,
    items: ['외국가수', '한국가수', '클래식', '뮤지컬 ', '기타'],
  },
  sports: {
    title: '스포츠중계',
    icon: SportsIcon,
    items: ['축구', '야구', 'F1', 'e스포츠', '기타'],
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

  // 전체 선택된 카테고리 개수 계산
  const getTotalSelectedCount = () => {
    return Object.values(selectedCategories).reduce((total, category) => total + category.length, 0);
  };

  const handleCategorySelect = (categoryKey: string, item: string) => {
    setSelectedCategories((prev: any) => {
      const currentCategory = prev[categoryKey as keyof typeof prev];
      const totalSelected = getTotalSelectedCount();

      if (currentCategory.includes(item)) {
        // 이미 선택된 경우 제거
        return {
          ...prev,
          [categoryKey]: currentCategory.filter((c: any) => c !== item),
        };
      } else if (totalSelected < 10) {
        // 총 10개 미만인 경우에만 추가
        return {
          ...prev,
          [categoryKey]: [...currentCategory, item as string],
        };
      }
      return prev; // 10개 이상이면 변경 없음
    });
  };

  const totalSelected = getTotalSelectedCount();
  const isValidSelection = totalSelected >= 1 && totalSelected <= 10;

  const handleNextStep = () => {
    // 선택한 카테고리 정보를 사용자 정보에 저장
    updateUserInfo({
      preferences: selectedCategories,
    });
    // 다음 단계로 이동
    router.push('/auth/info/step2');
  };

  return (
    <div className="w-full px-4 pt-32 sm:pt-20 sm:w-[376px] sm:mx-auto sm:px-0 flex flex-col gap-10">
      {/* header */}
      <div className="text-center">
        <h1 className="text-h3-b">필수 정보 입력하기</h1>
      </div>

      {/* main */}
      <div className="flex flex-col gap-5">
        <div className="border-b border-stroke-4 pb-2">
          <div className="flex justify-between items-end">
            <h2 className="text-h5-b">선호 카테고리 선택하기</h2>
            <span className={`text-p3 ${totalSelected >= 1 && totalSelected <= 10 ? 'text-Brand1-Primary' : 'text-tertiary'}`}>{totalSelected}/10</span>
          </div>
          <p className="text-p3 text-tertiary"> 선호 카테고리를 1개 이상 선택해야 가입이 완료됩니다. (최대 10개)</p>
        </div>
        {/* 카테고리 섹션들 */}
        <div className="flex flex-col gap-5">
          {Object.entries(categories).map(([key, category]) => (
            <div key={key}>
              <div className="flex items-center pb-2">
                <category.icon className="w-4 h-4" />
                <h3 className="text-p2-b text-Brand1-Primary">{category.title}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {category.items.map((item) => {
                  const isSelected = selectedCategories[key as keyof typeof selectedCategories].includes(item as string);
                  const totalSelected = getTotalSelectedCount();
                  const isDisabled = !isSelected && totalSelected >= 10; // 총 10개 이상 선택 시 비활성화
                  return (
                    <OutlinedButton key={item} size="sm" variant={isSelected ? 'brand1' : 'default'} onClick={() => handleCategorySelect(key, item)} disabled={isDisabled} className="flex-shrink-0">
                      {item}
                    </OutlinedButton>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* bottom: 다음 단계 버튼 */}
      <div className="">
        <Button
          onClick={handleNextStep}
          disabled={!isValidSelection}
          size="lg"
          variant={isValidSelection ? 'brand1' : 'secondary'}
          className={`w-full text-h6-b ${isValidSelection ? 'text-primary' : 'text-tertiary'}`}
        >
          다음 단계 &gt;
        </Button>
      </div>
    </div>
  );
}
