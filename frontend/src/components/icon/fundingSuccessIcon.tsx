import React from 'react';

interface FundingSuccessIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function FundingSuccessIcon({ 
  width = 20, 
  height = 20, 
  className = ''
}: FundingSuccessIconProps) {
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
        <linearGradient id="celebrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E83045" />
          <stop offset="50%" stopColor="#FF5768" />
          <stop offset="100%" stopColor="#B92D38" />
        </linearGradient>
        <linearGradient id="confettiGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2CD8CE" />
          <stop offset="100%" stopColor="#71E5DE" />
        </linearGradient>
      </defs>
      
      {/* 메인 별 */}
      <path
        d="M12 2L14.09 8.26L22 9L16 14.74L17.18 22.02L12 18.77L6.82 22.02L8 14.74L2 9L9.91 8.26L12 2Z"
        fill="url(#celebrationGradient)"
        stroke="none"
      />
      
      {/* 작은 별들 (confetti 효과) */}
      <circle cx="6" cy="6" r="1.5" fill="url(#confettiGradient1)" />
      <circle cx="18" cy="6" r="1" fill="#FFD700" />
      <circle cx="4" cy="18" r="1" fill="#FF5768" />
      <circle cx="20" cy="16" r="1.5" fill="url(#confettiGradient1)" />
      
      {/* 반짝임 효과 */}
      <path
        d="M12 6L12.5 7.5L14 8L12.5 8.5L12 10L11.5 8.5L10 8L11.5 7.5L12 6Z"
        fill="#FFFFFF"
        opacity="0.8"
      />
    </svg>
  );
}
