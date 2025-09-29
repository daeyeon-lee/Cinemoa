import React from 'react';

interface InfoIconProps {
  size?: number | string;       // 아이콘 크기 (가로/세로 동일)
  stroke?: string;              // 선 색상
  strokeWidth?: number | string; // 선 두께
}

const InfoIcon: React.FC<InfoIconProps> = ({
  size = 24,
  stroke = '#3F3F46',
  strokeWidth = 2,
}) => {
  return (
    <svg
      width={size}   // 가로 크기
      height={size}  // 세로 크기
      viewBox="0 0 24 24"
      fill="none"    // 채우기 없음
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke={stroke}          // 선 색상
        strokeWidth={strokeWidth} // 선 두께
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default InfoIcon;
