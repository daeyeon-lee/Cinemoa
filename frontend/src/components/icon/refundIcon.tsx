import React from 'react';

interface RefundIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function RefundIcon({ 
  width = 20, 
  height = 20, 
  className = ''
}: RefundIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="refundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2CD8CE" />
          <stop offset="50%" stopColor="#20ACA4" />
          <stop offset="100%" stopColor="#167873" />
        </linearGradient>
      </defs>
      
      {/* 원형 배경 */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="url(#refundGradient)"
        stroke="none"
      />
      
      {/* 달러 기호 */}
      <path
        d="M12 6V8M12 16V18M15 8H10.5C9.67157 8 9 8.67157 9 9.5C9 10.3284 9.67157 11 10.5 11H13.5C14.3284 11 15 11.6716 15 12.5C15 13.3284 14.3284 14 13.5 14H9"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 회전 화살표 */}
      {/* <path
        d="M8 4.5L6 6.5L4 4.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path
        d="M20 19.5L18 17.5L16 19.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      /> */}
    </svg>
  );
}
