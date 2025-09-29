import React from 'react';

interface VoteNotificationIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function VoteNotificationIcon({ 
  width = 20, 
  height = 20, 
  className = ''
}: VoteNotificationIconProps) {
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
        <linearGradient id="voteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E83045" />
          <stop offset="50%" stopColor="#FF5768" />
          <stop offset="100%" stopColor="#B92D38" />
        </linearGradient>
        <linearGradient id="barGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2CD8CE" />
          <stop offset="100%" stopColor="#20ACA4" />
        </linearGradient>
        <linearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#71E5DE" />
          <stop offset="100%" stopColor="#2CD8CE" />
        </linearGradient>
      </defs>
      
      {/* 원형 배경 */}
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="url(#voteGradient)"
        stroke="none"
      />
      
      {/* 차트 바 1 */}
      <rect
        x="6"
        y="10"
        width="3"
        height="8"
        rx="1.5"
        fill="url(#barGradient1)"
      />
      
      {/* 차트 바 2 */}
      <rect
        x="10.5"
        y="7"
        width="3"
        height="11"
        rx="1.5"
        fill="url(#barGradient2)"
      />
      
      {/* 차트 바 3 */}
      <rect
        x="15"
        y="12"
        width="3"
        height="6"
        rx="1.5"
        fill="url(#barGradient1)"
      />
      
      {/* 체크마크 (투표 완료 표시) */}
      {/* <path
        d="M8 6L10 8L16 4"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      /> */}
    </svg>
  );
}
