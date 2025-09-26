import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] px-3 py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed', {
  variants: {
    variant: {
      // 색상만 정의 + disabled 상태 스타일 추가
      primary: 'bg-BG-Inverse text-inverse disabled:bg-BG-1 disabled:text-tertiary disabled:border-stroke-4',
      secondary: 'bg-BG-3 text-primary hover:bg-BG-2',
      tertiary: 'bg-BG-2 text-secondary',
      subtle: 'bg-BG-1 text-tertiary',
      brand1: 'bg-Brand1-Primary text-primary hover:bg-Brand1-Secondary',
      brand2: 'bg-Brand2-Primary text-inverse hover:bg-Brand2-Secondary',
      outline: 'text-tertiary border-stroke-4 border-2 hover:border-stroke-1 hover:test-primary',
      ghost: 'bg-transparent text-inverse hover:bg-BG-2 hover:text-secondary',
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
