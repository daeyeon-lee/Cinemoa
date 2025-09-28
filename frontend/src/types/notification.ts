// SSE 이벤트 타입 정의
export type NotificationEventType = 
  | 'PAYMENT_SUCCESS'
  | 'FUNDING_SUCCESS' 
  | 'FUNDING_FAILED_REFUNDED'
  | 'VOTE_TO_FUNDING';

// SSE 연결 성공 이벤트
export interface SSEConnectedEvent {
  id: string;
  event: 'connected';
  data: string;
}

// 초기 데이터 이벤트
export interface SSEInitialDataEvent {
  id: string;
  event: 'INITIAL_DATA';
  data: NotificationEventDto[];
}

// 알림 이벤트 데이터
export interface NotificationEventDto {
  eventId: string;
  eventType: NotificationEventType;
  userId: number;
  message: string;
  data: NotificationEventData;
  timestamp: string;
  // 읽음 상태 (현재는 서버에서 보내지 않음)
  isRead?: boolean;
}

// 이벤트별 데이터 타입
export interface PaymentSuccessData {
  fundingId: number;
  fundingTitle: string;
  amount: number;
}

export interface FundingSuccessData {
  fundingId: number;
  fundingTitle: string;
  totalAmount: number;
  participantCount: number;
}

export interface FundingFailedRefundedData {
  fundingId: number;
  fundingTitle: string;
}

export interface VoteToFundingData {
  fundingId: number;
  fundingTitle: string;
}

export type NotificationEventData = 
  | PaymentSuccessData
  | FundingSuccessData
  | FundingFailedRefundedData
  | VoteToFundingData;

// SSE 이벤트 응답 타입
export interface SSEEventResponse {
  id: string;
  event: NotificationEventType;
  data: NotificationEventDto;
}

// 모든 SSE 이벤트 타입
export type SSEEvent = 
  | SSEConnectedEvent
  | SSEInitialDataEvent
  | SSEEventResponse;

// 알림 상태 관리용 타입
export interface NotificationState {
  notifications: NotificationEventDto[];
  isConnected: boolean;
  hasUnread: boolean;
}
