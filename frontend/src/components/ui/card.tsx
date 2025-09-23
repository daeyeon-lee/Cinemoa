import * as React from 'react';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('w-full bg-BG-0', {
  variants: {
    variant: {
      default: '',
      detail: 'border-t border-BG-2 pt-6',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

// 카드 기본값
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, children, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props}>
    {children}
  </div>
));
Card.displayName = 'Card';

// 카드 헤더
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('bg-BG-0', className)} {...props} />,
);
CardHeader.displayName = 'CardHeader';

// 카드 제목
const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('h4-b text-primary leading-none tracking-tight', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

// 카드 내용
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('bg-BG-1 p-5 p2 text-secondary rounded-[12px] ', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('h6 text-tertiary mt-1', className)} {...props} />,
);
CardDescription.displayName = 'CardDescription';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
