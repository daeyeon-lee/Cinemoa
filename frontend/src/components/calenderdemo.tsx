'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CalendarDemoProps {
  value?: string;
  onChange?: (date: string) => void;
  disabled?: boolean;
  min?: string;
  placeholder?: string;
}

export function CalendarDemo({ value = '', onChange, disabled = false, min, placeholder = 'Select date' }: CalendarDemoProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);

  // value prop이 변경될 때 내부 상태 업데이트
  React.useEffect(() => {
    if (value) {
      // 요일 정보가 포함된 경우 날짜 부분만 추출 (예: "2024-01-15 (월)" -> "2024-01-15")
      const dateOnly = value.split(' ')[0];
      const newDate = new Date(dateOnly);
      setDate(newDate);
    } else {
      setDate(undefined);
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false);

    if (onChange && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dayOfWeek = selectedDate.toLocaleDateString('ko-KR', { weekday: 'short' });
      onChange(`${year}-${month}-${day} (${dayOfWeek})`);
    }
  };

  const minDateObj = min ? new Date(min) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className="w-full h-10 justify-between whitespace-nowrap rounded-[6px] bg-BG-1 px-3 py-1 text-left font-normal shadow-sm ring-offset-background data-[placeholder]:text-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-none"
          disabled={disabled}
        >
          <span className={date ? 'text-primary' : 'text-secondary line-clamp-1'}>
            {date ? `${date.toLocaleDateString()} (${date.toLocaleDateString('ko-KR', { weekday: 'short' })})` : placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[280px] max-w-[400px] overflow-hidden p-0 border-none" align="center">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={handleDateSelect}
          disabled={
            minDateObj
              ? (date: Date) => {
                  const minDate = new Date(min!);
                  minDate.setHours(0, 0, 0, 0);
                  const compareDate = new Date(date);
                  compareDate.setHours(0, 0, 0, 0);

                  // min 날짜보다 이전 날짜는 비활성화 (min 날짜는 선택 가능)
                  return compareDate < minDate;
                }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
}
