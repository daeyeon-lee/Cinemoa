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

  // 검색어 입력 시 지도 생성
  useEffect(() => {
    // apiKey 오류메시지
    if (!apiKey) {
      console.error('API 키가 없습니다');
      return;
    }
    // 카카오맵 로드 확인
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
      // 로드 되지 않으면 상태 변경
      if (!isLoaded) {
        setIsLoaded(true);
      }
      // 지도 생성
      initializeMap();
    } else if (isLoaded) {
      // 지도 생성 대기
      setTimeout(() => {
        if (window.kakao && window.kakao.maps) {
          initializeMap();
        }
      }, 100);
    }
  }, [location, apiKey, isLoaded]);

  const initializeMap = () => {
    window.kakao.maps.load(() => {
      // 서비스 로드 확인
      const waitForServices = (attempts = 0) => {
        if (window.kakao.maps.services) {
          createMap();
        } else if (attempts < 10) {
          // 서비스 로드 대기
          setTimeout(() => waitForServices(attempts + 1), 200);
        }
      };

      // 지도 생성
      const createMap = () => {
        var mapContainer = document.getElementById('map');
        // map 컨테이너 오류메시지
        if (!mapContainer) {
          // console.error('map 컨테이너를 찾을 수 없습니다');
          return;
        }

        // 지도 옵션
        var mapOption = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표(서울시청)
          level: 3, // 지도의 확대 레벨
          draggable: true, // 지도 이동 기능 비활성화
        };

        // 지도 생성
        var map = new window.kakao.maps.Map(mapContainer as HTMLElement, mapOption);

        // 줌 컨트롤 생성
        var zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        // 지도 확대/축소 이벤트 등록
        window.kakao.maps.event.addListener(map, 'zoom_changed', function () {
          var level = map.getLevel();
        });

        // 장소 검색 객체 생성
        var places = new window.kakao.maps.services.Places();

        // 장소 검색
        places.keywordSearch(location, function (result: any, status: any) {
          // 정상적으로 검색이 완료됐으면
          if (status === window.kakao.maps.services.Status.OK) {
            // 좌표 생성
            var coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            // 장소명
            var placeName = result[0].place_name || location;
            // 마커 생성
            var marker = new window.kakao.maps.Marker({
              map: map, // 지도
              position: coords, // 좌표
              title: placeName, // 툴팁(마우스 올리면 표시)
            });

            // 인포윈도우 생성
            var infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="width:150px;text-align:center;padding:6px 0; color:black;">${placeName}</div>`,
            });
            infowindow.open(map, marker);
            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
            map.setCenter(coords);
          } else {
            // 오류메시지
            // console.error('장소 검색 실패:', status);
          }
        });
      };

      // 서비스 로드 대기
      waitForServices();
    });
  };

  return (
    <>
      {/* 카카오맵 스크립트 */}
      <Script
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`}
        strategy="beforeInteractive"
        onLoad={() => {
          setIsLoaded(true); // 스크립트 로드 완료 시 상태 변경
        }}
        onError={() => {
          setIsError(true); // 스크립트 로드 실패 시 상태 변경
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