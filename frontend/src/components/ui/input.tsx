import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
  // type별 기본 클래스 정의
  const getTypeClasses = (inputType?: string) => {
    switch (inputType) {
      default:
        return 'flex h-10 w-full rounded-[6px] bg-BG-1 px-3 py-1 text-p2-b shadow-sm transition-colors placeholder:text-subtle placeholder:text-p2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-p2';
      case 'checkbox':
        return 'appearance-none w-4 h-4 rounded bg-BG-2 border-2 border-stroke-3 cursor-pointer relative checked:bg-Brand1-Primary checked:border-Brand1-Primary checked:after:content-["✓"] checked:after:text-white checked:after:text-xs checked:after:absolute checked:after:top-0 checked:after:left-0 checked:after:w-full checked:after:h-full checked:after:flex checked:after:items-center checked:after:justify-center';
      case 'number':
        return 'flex h-10 w-full rounded-[6px] bg-BG-1 px-3 py-1 text-p2-b shadow-sm transition-colors placeholder:text-subtle placeholder:p1-b focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]';
      case 'search':
        return 'flex h-12 w-full bg-BG-0 px-1 py-4 text-h4 placeholder:text-primary placeholder:text-h4 md:h-16 md:text-h3 md:placeholder:text-h3 border-b-2 border-tertiary focus:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none';
    }
  };

  return <input type={type} className={cn(getTypeClasses(type), className)} ref={ref} {...props} />;
});
Input.displayName = 'Input';

export { Input };
