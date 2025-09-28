'use client';
import React, { useState, useRef, useEffect } from 'react';
import NotificationIcon from '@/component/icon/notificationIcon';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notification';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationEventDto } from '@/types/notification';

// 기존 Notification 인터페이스는 제거하고 NotificationEventDto 사용

interface NotificationDropdownProps {
  isMobile?: boolean;
}

export default function NotificationDropdown({ isMobile = false }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Store에서 알림 상태 가져오기
  const { notifications, isConnected, hasUnread } = useNotificationStore();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // hover 상태 관리
  useEffect(() => {
    if (isHovering) {
      setIsOpen(true);
    } else {
      // hover가 끝나면 약간의 지연 후 닫기 (드롭다운으로 마우스 이동할 시간 확보)
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isHovering]);

  const handleNotificationClick = (notification: NotificationEventDto) => {
    // 알림 클릭 시 읽음 처리
    markNotificationAsRead(notification.eventId);
    console.log('알림 클릭:', notification);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const getNotificationIcon = (eventType: string) => {
    switch (eventType) {
      case 'PAYMENT_SUCCESS':
        return '💳';
      case 'FUNDING_SUCCESS':
        return '🎉';
      case 'FUNDING_FAILED_REFUNDED':
        return '💰';
      case 'VOTE_TO_FUNDING':
        return '📊';
      default:
        return '🔔';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  const isNotificationRead = (notification: NotificationEventDto): boolean => {
    try {
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      return readNotifications.includes(notification.eventId);
    } catch {
      return false;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 아이콘 버튼 */}
      <button
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`relative flex items-center justify-center rounded-full hover:bg-BG-1 transition-colors duration-200 ${
          isMobile ? 'w-6 h-6 p-1' : 'w-8 h-8 p-1.5'
        }`}
      >
        <NotificationIcon 
          width={isMobile ? 26 : 30} 
          height={isMobile ? 26 : 30} 
          stroke="#94A3B8"
          className="hover:stroke-primary transition-colors duration-200"
        />
        {/* 안 읽은 알림 배지 */}
        {hasUnread && (
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#e83045] rounded-full border-2 border-[#e83045] flex items-center justify-center">
            <div className="w-1 h-1 bg-[#e83045] rounded-full"></div>
          </div>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-80 bg-BG-0 border border-BG-1 rounded-lg shadow-lg z-50 ${
            isMobile ? 'top-10' : 'top-12'
          }`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* 헤더 */}
          <div className="px-4 py-3 border-b border-BG-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">알림</h3>
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-tertiary hover:text-primary transition-colors"
              >
                모두 읽음
              </button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification: NotificationEventDto) => {
                const isRead = isNotificationRead(notification);
                return (
                  <div
                    key={notification.eventId}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-b border-BG-1 cursor-pointer hover:bg-BG-1 transition-colors ${
                      !isRead ? 'bg-BG-1/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">{getNotificationIcon(notification.eventType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm font-medium ${
                            !isRead ? 'text-primary' : 'text-secondary'
                          }`}>
                            {notification.message}
                          </p>
                          {!isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-tertiary mt-1">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm text-tertiary">
                  {isConnected ? '새로운 알림이 없습니다' : '알림 연결 중...'}
                </p>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2">
                    연결이 끊어졌습니다. 새로고침 후 다시 시도해주세요.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-BG-1">
              <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors">
                모든 알림 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
