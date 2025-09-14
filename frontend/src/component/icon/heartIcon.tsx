import React from 'react';

interface HeartIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  stroke?: string;
  strokeWidth?: number | string;
  fill?: string;
}

const HeartIcon: React.FC<HeartIconProps> = ({
  className = '',
  width = 19,
  height = 18,
  stroke = '#94A3B8',
  strokeWidth = 2,
  fill = 'none',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 19 18"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.00691 5.83343C3.17652 5.42396 3.42513 5.0519 3.73853 4.7385C4.05193 4.4251 4.42399 4.17649 4.83346 4.00688C5.24294 3.83727 5.68181 3.74997 6.12503 3.74997C6.56824 3.74997 7.00712 3.83727 7.41659 4.00688C7.82607 4.17649 8.19813 4.4251 8.51153 4.7385L9.50003 5.727L10.4885 4.7385C11.1215 4.10556 11.9799 3.74998 12.875 3.74998C13.7701 3.74998 14.6286 4.10556 15.2615 4.7385C15.8945 5.37144 16.25 6.22989 16.25 7.125C16.25 8.02011 15.8945 8.87856 15.2615 9.5115L9.50003 15.273L3.73853 9.5115C3.42513 9.1981 3.17652 8.82604 3.00691 8.41656C2.8373 8.00709 2.75 7.56821 2.75 7.125C2.75 6.68178 2.8373 6.24291 3.00691 5.83343Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HeartIcon;
