import React from 'react';

interface PaymentSuccessIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function PaymentSuccessIcon({ 
  width = 20, 
  height = 20, 
  className = ''
}: PaymentSuccessIconProps) {
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
        <linearGradient id="paymentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2CD8CE" />
          <stop offset="100%" stopColor="#71E5DE" />
        </linearGradient>
      </defs>
      
      {/* 신용카드 배경 */}
      <rect
        x="2"
        y="4"
        width="20"
        height="14"
        rx="2"
        ry="2"
        fill="url(#paymentGradient)"
        stroke="none"
      />
      
      {/* 카드 자기 띠 */}
      <rect
        x="2"
        y="8"
        width="20"
        height="2"
        fill="#167873"
      />
      
      {/* 성공 체크마크 */}
      <path
        d="M8 12L10.5 14.5L16 9"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
