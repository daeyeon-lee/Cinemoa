'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 'd0d21023ec87c03f572bcf9ba5d62bfd';

interface KakaoMapProps {
  location: string;
  width?: string;
  height?: string;
  className?: string;
}

const KakaoMap = ({ location, width = '100%', height = '400px', className }: KakaoMapProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const apiKey = KAKAO_MAP_API_KEY;

  console.log('KakaoMap 렌더링:', { isLoaded, isError, apiKey: !!apiKey, location });

  useEffect(() => {
    console.log('useEffect 실행:', { apiKey: !!apiKey, isLoaded, location });

    if (!apiKey) {
      console.error('API 키가 없습니다');
      return;
    }

    // 스크립트가 로드되었는지 직접 확인
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
      console.log('카카오맵이 이미 로드되어 있음');
      if (!isLoaded) {
        setIsLoaded(true);
      }
      initializeMap();
    } else if (isLoaded) {
      console.log('isLoaded가 true이지만 window.kakao가 없음, 잠시 후 재시도');
      setTimeout(() => {
        if (window.kakao && window.kakao.maps) {
          console.log('window.kakao 재확인됨');
          initializeMap();
        }
      }, 100);
    } else {
      console.log('스크립트가 아직 로드되지 않음');
    }
  }, [location, apiKey, isLoaded]);

  const initializeMap = () => {
    // 카카오맵이 완전히 로드될 때까지 기다림
    window.kakao.maps.load(() => {
      console.log('카카오맵 API 로드 완료');

      // services 객체가 준비될 때까지 잠시 기다림
      setTimeout(() => {
        console.log('services 객체 확인:', window.kakao.maps.services);

        if (!window.kakao.maps.services) {
          console.error('services 객체가 아직 준비되지 않음');
          return;
        }

        var mapContainer = document.getElementById('map'); // 지도를 표시할 div
        if (!mapContainer) {
          console.error('map 컨테이너를 찾을 수 없습니다');
          return;
        }

        var mapOption = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
          level: 3, // 지도의 확대 레벨
        };

        // 지도를 생성합니다
        var map = new window.kakao.maps.Map(mapContainer as HTMLElement, mapOption);
        console.log('지도 생성 완료');

        // 주소-좌표 변환 객체를 생성합니다
        var geocoder = new window.kakao.maps.services.Geocoder();
        console.log('Geocoder 생성 완료');

        // 주소로 좌표를 검색합니다
        geocoder.addressSearch(location, function (result: any, status: any) {
          // 정상적으로 검색이 완료됐으면
          if (status === window.kakao.maps.services.Status.OK) {
            var coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

            // 결과값으로 받은 위치를 마커로 표시합니다
            var marker = new window.kakao.maps.Marker({
              map: map,
              position: coords,
            });
            console.log('마커 생성 완료:', marker);

            // 인포윈도우로 장소에 대한 설명을 표시합니다
            var infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="width:150px;text-align:center;padding:6px 0;">${location}</div>`,
            });
            infowindow.open(map, marker);

            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
            map.setCenter(coords);
            console.log('지도 설정 완료');
          } else {
            console.error('주소 검색 실패:', status);
          }
        });
      }, 100); // 100ms 대기
    });
  };

  // 에러 메시지
  if (!apiKey) {
    return <div>카카오맵 API 키가 설정되지 않았습니다.</div>;
  }

  if (isError) {
    return <div>지도를 불러오는데 실패했습니다.</div>;
  }

  if (!location) {
    return <div>주소가 설정되지 않았습니다.</div>;
  }

  return (
    <>
      {/* 카카오맵 스크립트 로드 */}
      <Script
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`}
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('카카오맵 스크립트 로드 완료');
          setIsLoaded(true);
        }}
        onError={(e) => {
          console.error('카카오맵 스크립트 로드 실패:', e);
          setIsError(true);
        }}
      />

      <div style={{ width, height }} className={className}>
        <div className="flex items-center justify-center h-full">
          {!isLoaded ? <div>지도를 불러오는 중입니다...</div> : <div id="map" className="w-full h-full" />}
        </div>
      </div>
    </>
  );
};

export default KakaoMap;
