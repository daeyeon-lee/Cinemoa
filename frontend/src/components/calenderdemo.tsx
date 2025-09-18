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
    const newDate = value ? new Date(value) : undefined;
    setDate(newDate);
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false);

    if (onChange && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
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
          <span className={date ? 'text-primary' : 'text-secondary line-clamp-1'}>{date ? date.toLocaleDateString() : placeholder}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0 border-none" align="start">
        <Calendar mode="single" selected={date} captionLayout="dropdown" onSelect={handleDateSelect} disabled={minDateObj ? (date: Date) => date < minDateObj : undefined} />
      </PopoverContent>
    </Popover>
  );
}
