import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px]', {
  variants: {
    variant: {
      primary: 'bg-BG-Inverse text-inverse',
      secondary: 'bg-BG-3 text-primary hover:bg-BG-4',
      brand1: 'bg-Brand1-Primary text-primary hover:bg-Brand1-Secondary',
      brand2: 'bg-Brand2-Primary text-inverse hover:bg-Brand2-Secondary',
      outline: 'text-tertiary hover:border-stroke-2 border-stroke-4 cursor-pointer rounded-lg border-2 transition-all',
    },
    size: {
      sm: 'h-8 w-8 text-p3-b rounded-[6px]', // 작은 버튼
      md: 'h-9 w-16 px-4 text-p2-b rounded-[6px]', // 중간 버튼
      lg: 'h-12 w-21 px-6 text-h6-b rounded-[6px]', // 큰 버튼
      icon: 'h-9 w-9',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'lg',
  },
});
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
