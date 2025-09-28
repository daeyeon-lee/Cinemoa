import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { NotificationEventDto } from '@/types/notification';

// SSE 연결 관리 클래스
class NotificationSSEManager {
  private eventSource: EventSource | null = null;

  constructor() {
    // 로그인된 사용자가 있다면 자동으로 SSE 연결 시도
    this.autoConnectIfLoggedIn();
  }

  // 로그인된 사용자가 있다면 자동으로 SSE 연결 시도
  private autoConnectIfLoggedIn() {
    const { user } = useAuthStore.getState();
    if (user && user.userId) {
      console.log('🔄 로그인된 사용자 감지, SSE 자동 연결 시도');
      setTimeout(() => {
        this.connect().catch(error => {
          console.log('🔄 자동 연결 실패:', error);
        });
      }, 1000);
    }
  }

  // SSE 연결 시작
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 기존 연결이 있다면 먼저 닫기
        this.disconnect();

        // 로그인 상태 확인
        const { user } = useAuthStore.getState();
        if (!user || !user.userId) {
          console.warn('사용자가 로그인되지 않았습니다. SSE 연결을 건너뜁니다.');
          reject(new Error('사용자가 로그인되지 않았습니다.'));
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_BASE_URL}notification/subscribe`;
        console.log('SSE 연결 시도:', url);
        console.log('현재 사용자:', user);
        
        this.eventSource = new EventSource(url, {
          withCredentials: true // 쿠키 포함
        });

        // 연결 성공 이벤트
        this.eventSource.addEventListener('connected', (event) => {
          console.log('SSE 연결 성공:', event);
          useNotificationStore.getState().setConnected(true);
          resolve();
        });

        // 초기 데이터 이벤트
        this.eventSource.addEventListener('INITIAL_DATA', (event) => {
          console.log('🔥 INITIAL_DATA 이벤트 수신됨!', event);
          console.log('🔥 INITIAL_DATA 데이터:', event.data);
          try {
            const data: NotificationEventDto[] = JSON.parse(event.data);
            useNotificationStore.getState().setNotifications(data);
            console.log('초기 알림 데이터 로드:', data);
          } catch (error) {
            console.error('초기 데이터 파싱 오류:', error);
          }
        });

        // 실시간 알림 이벤트들
        this.eventSource.addEventListener('PAYMENT_SUCCESS', (event) => {
          this.handleNotificationEvent(event);
        });

        this.eventSource.addEventListener('FUNDING_SUCCESS', (event) => {
          this.handleNotificationEvent(event);
        });

        this.eventSource.addEventListener('FUNDING_FAILED_REFUNDED', (event) => {
          this.handleNotificationEvent(event);
        });

        this.eventSource.addEventListener('VOTE_TO_FUNDING', (event) => {
          this.handleNotificationEvent(event);
        });

        this.eventSource.addEventListener('FUNDING_REFUND', (event) => {
          this.handleNotificationEvent(event);
        });

        // 모든 메시지 이벤트 캐치 (디버깅용)
        this.eventSource.onmessage = (event) => {
          console.log('📨 모든 메시지 이벤트 수신:', event);
          console.log('📨 이벤트 타입:', event.type);
          console.log('📨 이벤트 데이터:', event.data);
          console.log('📨 이벤트 ID:', event.lastEventId);
        };

        // 연결 오류 처리
        this.eventSource.onerror = (error) => {
          console.error('SSE 연결 오류:', error);
          console.error('EventSource readyState:', this.eventSource?.readyState);
          console.error('EventSource URL:', this.eventSource?.url);
          useNotificationStore.getState().setConnected(false);
          reject(error);
        };

      } catch (error) {
        console.error('SSE 연결 생성 오류:', error);
        reject(error);
      }
    });
  }

  // 알림 이벤트 처리
  private handleNotificationEvent(event: MessageEvent) {
    try {
      console.log('🔔 알림 이벤트 처리 시작:', event);
      console.log('🔔 이벤트 데이터:', event.data);
      console.log('🔔 이벤트 타입:', event.type);
      
      const notificationData: NotificationEventDto = JSON.parse(event.data);
      console.log('🔔 파싱된 알림 데이터:', notificationData);
      
      // Store에 알림 추가
      useNotificationStore.getState().addNotification(notificationData);
      console.log('🔔 Store에 알림 추가 완료');
      console.log('새 알림 수신:', notificationData);
    } catch (error) {
      console.error('알림 이벤트 파싱 오류:', error);
    }
  }

  // SSE 연결 종료
  disconnect() {
    if (this.eventSource) {
      console.log('SSE 연결 종료');
      this.eventSource.close();
      this.eventSource = null;
      useNotificationStore.getState().setConnected(false);
    }
  }
}

// 싱글톤 인스턴스
const notificationSSEManager = new NotificationSSEManager();

// SSE 연결 시작
export const connectNotificationSSE = (): Promise<void> => {
  return notificationSSEManager.connect();
};

// SSE 연결 종료
export const disconnectNotificationSSE = (): void => {
  notificationSSEManager.disconnect();
};

// 알림 읽음 처리
export const markNotificationAsRead = (eventId: string): void => {
  useNotificationStore.getState().markAsRead(eventId);
};

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = (): void => {
  useNotificationStore.getState().markAllAsRead();
};

// 모든 알림 초기화
export const clearAllNotifications = (): void => {
  useNotificationStore.getState().clearNotifications();
};