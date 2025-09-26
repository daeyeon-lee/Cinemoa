interface LocationIconProps {
  fill?: string;
  stroke?: string;
  width?: number | string;
  height?: number | string;
}

function LocationIcon({ fill = '#1E293B', stroke = '#94A3B8', width = 24, height = 26 }: LocationIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.343 16.657L10.586 20.9C10.7716 21.0857 10.9919 21.233 11.2344 21.3336C11.477 21.4341 11.7369 21.4859 11.9995 21.4859C12.262 21.4859 12.522 21.4341 12.7646 21.3336C13.0071 21.233 13.2274 21.0857 13.413 20.9L17.657 16.657C18.7758 15.5381 19.5377 14.1127 19.8463 12.5608C20.155 11.009 19.9965 9.40047 19.391 7.93868C18.7855 6.4769 17.7601 5.22749 16.4445 4.34846C15.1289 3.46943 13.5822 3.00024 12 3.00024C10.4178 3.00024 8.87106 3.46943 7.55548 4.34846C6.23989 5.22749 5.21451 6.4769 4.609 7.93868C4.00349 9.40047 3.84504 11.009 4.15368 12.5608C4.46233 14.1127 5.22422 15.5381 6.343 16.657V16.657Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.87868 13.1213C9.31607 12.5587 9 11.7956 9 11C9 10.2044 9.31607 9.44129 9.87868 8.87868C10.4413 8.31607 11.2044 8 12 8C12.7956 8 13.5587 8.31607 14.1213 8.87868C14.6839 9.44129 15 10.2044 15 11C15 11.7956 14.6839 12.5587 14.1213 13.1213C13.5587 13.6839 12.7956 14 12 14C11.2044 14 10.4413 13.6839 9.87868 13.1213Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default LocationIcon;
