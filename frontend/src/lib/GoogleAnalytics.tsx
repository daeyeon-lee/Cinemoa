import Script from 'next/script';

// Google Analytics 4 이벤트 추적을 위한 타입 정의
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <Script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', '${gaId}', {
							page_title: document.title,
							page_location: window.location.href
						});
					`,
        }}
      />
    </>
  );
}

// GA4 이벤트 추적 함수들
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 페이지뷰 추적
export const trackPageView = (gaId: string, url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', gaId, {
      page_title: title || document.title,
      page_location: url,
    });
  }
};

// 사용자 속성 설정
export const setUserProperties = (gaId: string, properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', gaId, {
      user_properties: properties,
    });
  }
};

// 커스텀 이벤트 추적
export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// 비즈니스 메트릭 추적 함수들
export const trackFundingEvent = (action: string, fundingId: number, amount?: number, category?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'funding_event', {
      event_category: 'funding',
      event_label: action,
      funding_id: fundingId,
      value: amount || 0,
      currency: 'KRW',
      category: category || 'unknown',
    });
  }
};

export const trackUserAction = (action: string, itemId: number, itemType: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'user_action', {
      event_category: 'engagement',
      event_label: action,
      item_id: itemId,
      item_type: itemType,
    });
  }
};

export const trackPaymentEvent = (action: string, amount: number, currency: string = 'KRW') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'payment_event', {
      event_category: 'ecommerce',
      event_label: action,
      value: amount,
      currency: currency,
    });
  }
};

export const trackSearchEvent = (searchTerm: string, resultsCount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      event_category: 'engagement',
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }
};
