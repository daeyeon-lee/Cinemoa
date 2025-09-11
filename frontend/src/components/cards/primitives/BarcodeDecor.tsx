import React from 'react';
import { cn } from '@/lib/utils';

type BarcodeDecorProps = {
  width?: number;
  height?: number | "full";
  className?: string;
};

const BarcodeDecor: React.FC<BarcodeDecorProps> = ({
  width = 24,
  height = "full",
  className
}) => {
  const isFullHeight = height === "full";
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center",
        isFullHeight ? "h-full flex-1 min-h-0" : "",
        className
      )}
      style={{ width, ...(!isFullHeight && { height }) }}
      aria-hidden="true"
    >
      <svg 
        width={width} 
        height={isFullHeight ? "100%" : height} 
        viewBox="0 0 24 102" 
        fill="none" 
        className="text-subtle h-full"
        preserveAspectRatio="none"
      >
        <path d="M-7.62939e-06 102L-6.79713e-06 92.48L24 92.48L24 102L-7.62939e-06 102Z" fill="currentColor"/>
        <path d="M-6.44044e-06 88.4L-6.32155e-06 87.04L24 87.04L24 88.4L-6.44044e-06 88.4Z" fill="currentColor"/>
        <path d="M-5.96486e-06 82.96L-5.60818e-06 78.88L24 78.88L24 82.96L-5.96486e-06 82.96Z" fill="currentColor"/>
        <path d="M-5.2515e-06 74.8L-5.1326e-06 73.44L24 73.44L24 74.8L-5.2515e-06 74.8Z" fill="currentColor"/>
        <path d="M-4.77592e-06 69.36L-4.65702e-06 68L24 68L24 69.36L-4.77592e-06 69.36Z" fill="currentColor"/>
        <path d="M-4.30034e-06 63.92L-3.94365e-06 59.84L24 59.84L24 63.92L-4.30034e-06 63.92Z" fill="currentColor"/>
        <path d="M-3.58697e-06 55.76L-2.8736e-06 47.6L24 47.6L24 55.76L-3.58697e-06 55.76Z" fill="currentColor"/>
        <path d="M-2.51691e-06 43.52L-2.39802e-06 42.16L24 42.16L24 43.52L-2.51691e-06 43.52Z" fill="currentColor"/>
        <path d="M-2.04133e-06 38.08L-1.68465e-06 34L24 34L24 38.08L-2.04133e-06 38.08Z" fill="currentColor"/>
        <path d="M-1.32796e-06 29.92L-8.52381e-07 24.48L24 24.48L24 29.92L-1.32796e-06 29.92Z" fill="currentColor"/>
        <path d="M-4.95697e-07 20.4L-3.76802e-07 19.04L24 19.04L24 20.4L-4.95697e-07 20.4Z" fill="currentColor"/>
        <path d="M-2.01166e-08 14.96L9.87784e-08 13.6L24 13.6L24 14.96L-2.01166e-08 14.96Z" fill="currentColor"/>
        <path d="M4.55463e-07 9.52L5.74359e-07 8.16L24 8.16L24 9.52L4.55463e-07 9.52Z" fill="currentColor"/>
        <path d="M9.31043e-07 4.08001L1.28773e-06 5.53125e-06L24 7.62939e-06L24 4.08001L9.31043e-07 4.08001Z" fill="currentColor"/>
      </svg>
    </div>
  );
};

export { BarcodeDecor };
export type { BarcodeDecorProps };