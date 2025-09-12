'use client';

import React from 'react';
import { Map as KakaoMap, useKakaoLoader } from 'react-kakao-maps-sdk';

interface KakaoMapProps {
  center?: { lat: number; lng: number };
  level?: number;
  width?: string;
  height?: string;
  className?: string;
}

const kakaoMap = ({
  center = { lat: 37.5665, lng: 126.978 }, // 서울 기본값
  level = 3,
  width = '100%',
  height = '400px',
  className,
}: KakaoMapProps) => {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ?? '',
  });

  if (loading) return <div>지도를 불러오는 중입니다...</div>;
  if (error) return <div>지도를 불러오는데 실패했습니다: {error.message}</div>;

  return (
    <div style={{ width, height }} className={className}>
      <KakaoMap center={center} level={level} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default kakaoMap;
