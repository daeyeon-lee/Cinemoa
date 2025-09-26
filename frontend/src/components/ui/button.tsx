import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] px-3 py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed', {
  variants: {
    variant: {
      // 색상만 정의 + disabled 상태 스타일 추가
      primary: 'bg-BG-Inverse text-inverse disabled:bg-stroke-3 disabled:text-tertiary',
      secondary: 'bg-BG-3 text-secondary hover:bg-BG-2 disabled:bg-stroke-3 disabled:text-secondary',
      tertiary: 'bg-BG-2 text-secondary disabled:bg-stroke-4 disabled:text-subtle',
      subtle: 'bg-BG-1 text-tertiary disabled:bg-stroke-3 disabled:text-secondary',
      brand1: 'bg-Brand1-Primary text-primary hover:bg-Brand1-Secondary disabled:bg-stroke-3 disabled:text-secondary',
      brand2: 'bg-Brand2-Primary text-inverse hover:bg-Brand2-Secondary disabled:bg-stroke-3 disabled:text-secondary',
      outline: 'text-tertiary hover:border-stroke-2 border-stroke-4 border-2 disabled:bg-BG-0 disabled:border-stroke-4 disabled:text-subtle',
      ghost: 'bg-transparent text-inverse hover:bg-BG-2 hover:text-secondary disabled:text-subtle',
    },
    size: {
      // 크기만 정의
      sm: 'h-8 px-3',
      md: 'h-9 px-4 ',
      lg: 'h-12 px-6 ',
      icon: 'h-9 w-9 ',
    },
    // 글자 크기 별도 variant
    textSize: {
      sm: 'p3-b',
      md: 'p2-b',
      lg: 'h6-b',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    textSize: 'md',
  },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, textSize, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, textSize, className }))} ref={ref} {...props} />;
});

Button.displayName = 'Button';

export { Button, buttonVariants };
