import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RotateCcw } from 'lucide-react';

/**
 * 상영관 타입 아이템 인터페이스
 */
interface TheaterTypeItem {
  label: string;
  value: string;
}

/**
 * TheaterTypeFilterPanel 컴포넌트의 props 타입
 */
interface TheaterTypeFilterPanelProps {
  /** 표시할 상영관 타입 목록 */
  types: TheaterTypeItem[];
  /** 현재 선택된 상영관 타입들 (label 기준) */
  value: string[];
  /** 상영관 타입 선택 변경 시 호출되는 콜백 함수 */
  onChange: (value: string[]) => void;
  /** 필터 초기화 시 호출되는 콜백 함수 */
  onReset: () => void;
  /** 색상 variant (brand1: 빨간색, brand2: 청록색) */
  variant?: 'brand1' | 'brand2';
}

/**
 * TheaterTypeFilterPanel 컴포넌트
 *
 * @description 데스크탑 ListShell의 sidebar 영역에서 사용하는 상영관 타입 필터 패널입니다.
 * 다중 선택이 가능하며, 초기화 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * const theaterTypes = [
 *   { label: '일반', value: 'normal' },
 *   { label: 'IMAX', value: 'imax' },
 *   { label: '4DX', value: '4dx' }
 * ];
 *
 * <TheaterTypeFilterPanel
 *   types={theaterTypes}
 *   value={selectedTypes}
 *   onChange={setSelectedTypes}
 *   onReset={() => setSelectedTypes([])}
 * />
 * ```
 *
 * @param props.types - 표시할 상영관 타입 목록
 * @param props.value - 현재 선택된 상영관 타입들
 * @param props.onChange - 상영관 타입 선택 변경 핸들러
 * @param props.onReset - 필터 초기화 핸들러
 */
const TheaterTypeFilterPanel: React.FC<TheaterTypeFilterPanelProps> = ({ types, value, onChange, onReset, variant = 'brand1' }) => {
  /**
   * 상영관 타입 선택/해제를 토글하는 핸들러
   * @param label - 토글할 상영관 타입 라벨
   */
  const handleToggle = (label: string) => {
    const newValue = value.includes(label)
      ? value.filter((v) => v !== label) // 이미 선택된 경우 제거
      : [...value, label]; // 선택되지 않은 경우 추가
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      {/* 패널 제목 */}
      <div className="flex items-center justify-between border-b border-stroke-3 pb-2">
        <h3 className="text-h4-b">상영관</h3>
        {/* 초기화 버튼 */}
        <Button size="sm" onClick={onReset} className="text-p2-b bg-bg-0 text-tertiary flex items-center gap-1 pr-0" disabled={value.length === 0}>
          <RotateCcw size={14} />
          초기화
        </Button>
      </div>

      {/* 상영관 타입 선택 */}
      <div className="">
        {types.map((type) => {
          const isSelected = value.includes(type.label);

          return (
            <div key={type.value} className="flex items-center justify-between py-3 border-b border-stroke-3 text-p2 cursor-pointer" onClick={() => handleToggle(type.label)}>
              <Label className="text-sm text-slate-200 cursor-pointer">{type.label}</Label>
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 cursor-pointer transition-colors flex items-center justify-center',
                  isSelected ? (variant === 'brand2' ? 'border-[#2cd8ce] bg-[#2cd8ce]' : 'border-[#e83045] bg-[#e83045]') : 'border-stroke-3 bg-transparent',
                )}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { TheaterTypeFilterPanel };
