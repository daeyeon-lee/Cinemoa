'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface OutlinedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'brand1' | 'brand2';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const OutlinedButton = React.forwardRef<HTMLButtonElement, OutlinedButtonProps>(({ className, variant = 'default', size = 'md', children, disabled, ...props }, ref) => {
  const baseStyles = 'border rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

  const variantStyles = {
    default: 'text-[var(--text-tertiary)] border-[var(--stroke-4)] hover:border-[var(--stroke-2)] hover:text-[var(--text-secondary)]',
    brand1: 'text-[var(--brand1-strong)] border-[var(--brand1-primary)] hover:border-[var(--brand1-secondary)] hover:text-[var(--brand1-primary)]',
    brand2: 'text-[var(--brand2-strong)] border-[var(--brand2-primary)] hover:border-[var(--brand2-secondary)] hover:text-[var(--brand2-primary)]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = disabled ? 'text-[var(--text-tertiary)] border-[var(--stroke-4)] opacity-50 cursor-not-allowed hover:border-[var(--stroke-4)] hover:text-[var(--text-tertiary)]' : '';

  return (
    <button className={cn(baseStyles, disabled ? disabledStyles : variantStyles[variant], sizeStyles[size], className)} ref={ref} disabled={disabled} {...props}>
      {children}
    </button>
  );
});

OutlinedButton.displayName = 'OutlinedButton';

export default OutlinedButton;
