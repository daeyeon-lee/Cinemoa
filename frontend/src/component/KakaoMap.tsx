'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
const KAKAO_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`;

// 환경 변수 디버깅
console.log('=== KakaoMap 환경 변수 확인 ===');
console.log('KAKAO_API_KEY:', KAKAO_API_KEY);
console.log('KAKAO_URL:', KAKAO_URL);

interface KakaoMapProps {
  center?: { lat: number; lng: number }; // 중심 좌표 (기본값: 서울)
  level?: number; // 줌 레벨 (기본값: 3)
  width?: string; // 지도 너비 (기본값: 100%)
  height?: string; // 지도 높이 (기본값: 400px)
  markers?: { lat: number; lng: number }[]; // 마커 좌표 배열
  onMapLoad?: (map: any) => void; // 지도 객체가 로드된 후 실행할 콜백
}

const KakaoMap = ({
  center = { lat: 37.5665, lng: 126.978 }, // 기본값: 서울
  level = 3,
  width = '100%',
  height = '400px',
  markers = [],
  onMapLoad,
}: KakaoMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps || !mapContainer.current) {
        console.warn('카카오맵이 아직 로드되지 않았거나, 컨테이너가 없음.');
        return;
      }

      const map = new window.kakao.maps.Map(mapContainer.current, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: level,
      });

      console.log('🗺️ 맵 초기화 완료', map);

      // 마커 추가 (여러 개 지원)
      markers.forEach((marker) => {
        new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
          map,
        });
      });

      // 지도가 로드된 후 콜백 실행
      if (onMapLoad) {
        onMapLoad(map);
      }
    };

    if (isLoaded) {
      console.log('📡 카카오맵 API 로드됨, `window.kakao.maps.load(initMap)` 실행');
      window.kakao.maps.load(initMap);
    }
  }, [isLoaded, center, level, markers]); // ✅ center, level, markers가 바뀌면 지도 업데이트

  return (
    <>
      {/* 카카오맵 API 로드 */}
      <Script
        src={KAKAO_URL}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ 카카오맵 스크립트 로드 완료');
          setIsLoaded(true);
        }}
        onError={(e) => console.error('🚨 카카오맵 스크립트 로드 실패:', e)}
      />
      {/* 맵을 표시할 div */}
      <div ref={mapContainer} style={{ width: width, height: height, backgroundColor: 'green' }} />
    </>
  );
};

export default KakaoMap;
