'use client';

import { useEffect, useState } from 'react';

export default function GA4Debugger() {
  const [gaStatus, setGaStatus] = useState<{
    gtagLoaded: boolean;
    dataLayerExists: boolean;
    gaId: string;
    lastEvent: string;
  }>({
    gtagLoaded: false,
    dataLayerExists: false,
    gaId: '',
    lastEvent: '',
  });

  useEffect(() => {
    const checkGA4 = () => {
      const gtagLoaded = typeof window !== 'undefined' && typeof window.gtag === 'function';
      const dataLayerExists = typeof window !== 'undefined' && Array.isArray(window.dataLayer);
      const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_DEVELOP || '';

      setGaStatus({
        gtagLoaded,
        dataLayerExists,
        gaId,
        lastEvent: '',
      });

      // 테스트 이벤트 전송
      if (gtagLoaded) {
        window.gtag('event', 'ga4_debug_test', {
          event_category: 'debug',
          event_label: 'GA4 설정 확인',
        });
        setGaStatus((prev) => ({
          ...prev,
          lastEvent: '테스트 이벤트 전송됨',
        }));
      }
    };

    // 컴포넌트 마운트 후 확인
    const timer = setTimeout(checkGA4, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#000',
        color: '#fff',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
      }}
    >
      <h4>GA4 디버그 정보</h4>
      <div>✅ gtag 로드됨: {gaStatus.gtagLoaded ? 'Yes' : 'No'}</div>
      <div>✅ dataLayer 존재: {gaStatus.dataLayerExists ? 'Yes' : 'No'}</div>
      <div>✅ GA ID: {gaStatus.gaId || 'Not Set'}</div>
      <div>✅ 마지막 이벤트: {gaStatus.lastEvent}</div>
      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <button
          onClick={() => {
            if (window.gtag) {
              window.gtag('event', 'manual_test', {
                event_category: 'debug',
                event_label: '수동 테스트',
              });
              alert('테스트 이벤트 전송됨!');
            }
          }}
          style={{ padding: '5px', fontSize: '10px' }}
        >
          테스트 이벤트 전송
        </button>
      </div>
    </div>
  );
}
