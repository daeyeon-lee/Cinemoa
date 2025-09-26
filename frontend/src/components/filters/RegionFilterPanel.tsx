import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';

/**
 * RegionFilterPanel 컴포넌트의 props 타입
 */
interface RegionFilterPanelProps {
  /** 표시할 지역 목록 */
  regions: string[];
  /** 현재 선택된 지역들 */
  value: string[];
  /** 지역 선택 변경 시 호출되는 콜백 함수 */
  onChange: (value: string[]) => void;
  /** 필터 초기화 시 호출되는 콜백 함수 */
  onReset: () => void;
  /** 색상 variant (brand1: 빨간색, brand2: 청록색) */
  variant?: 'brand1' | 'brand2';
}

/**
 * RegionFilterPanel 컴포넌트
 *
 * @description ListShell의 sidebar 영역에서 사용하는 지역 필터 패널입니다.
 * 다중 선택이 가능하며, 초기화 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * // TODO: 실제 지역 데이터로 교체 필요
 * const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전'];
 *
 * <RegionFilterPanel
 *   regions={regions}
 *   value={selectedRegions}
 *   onChange={setSelectedRegions}
 *   onReset={() => setSelectedRegions([])}
 * />
 * ```
 *
 * @param props.regions - 표시할 지역 목록
 * @param props.value - 현재 선택된 지역들
 * @param props.onChange - 지역 선택 변경 핸들러
 * @param props.onReset - 필터 초기화 핸들러
 */
const RegionFilterPanel: React.FC<RegionFilterPanelProps> = ({ regions, value, onChange, onReset, variant = 'brand1' }) => {
  /**
   * 지역 선택/해제를 토글하는 핸들러
   * @param region - 토글할 지역명
   */
  const handleToggle = (region: string) => {
    const newValue = value.includes(region)
      ? value.filter((v) => v !== region) // 이미 선택된 경우 제거
      : [...value, region]; // 선택되지 않은 경우 추가
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      {/* 패널 제목 */}
      <div className="flex items-center justify-between border-b border-stroke-3 pb-2">
        <h3 className="text-h4-b">지역</h3>
        {/* 초기화 버튼 */}
        <Button size="sm" onClick={onReset} className="text-p2-b bg-bg-0 text-tertiary flex items-center gap-1 pr-0" disabled={value.length === 0}>
          <RotateCcw size={14} />
          초기화
        </Button>
      </div>

      {/* 지역 선택 버튼 목록 */}
      <div className="flex flex-wrap gap-x-1.5 gap-y-2.5">
        {regions.map((region) => {
          const isSelected = value.includes(region);
          return (
            <Button
              key={region}
              variant={isSelected ? variant : 'outline'}
              size="sm"
              onClick={() => handleToggle(region)}
              className={cn('justify-start text-left px-3 py-2 text-p3-b text-tertiary', isSelected && 'text-primary')}
            >
              {region}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export { RegionFilterPanel };
