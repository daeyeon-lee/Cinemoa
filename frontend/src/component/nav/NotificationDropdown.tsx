'use client';
import React, { useState, useRef, useEffect } from 'react';
import NotificationIcon from '@/component/icon/notificationIcon';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'funding' | 'vote' | 'system';
}

interface NotificationDropdownProps {
  isMobile?: boolean;
}

export default function NotificationDropdown({ isMobile = false }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true); // 임시로 true로 설정
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // 임시 알림 데이터 (나중에 API로 교체)
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: '새로운 상영회가 등록되었습니다',
      message: '영화 "인터스텔라" 상영회가 등록되었습니다.',
      time: '5분 전',
      isRead: false,
      type: 'funding'
    },
    {
      id: '2',
      title: '수요조사 참여해주세요',
      message: '영화 "오펜하이머" 수요조사에 참여해보세요.',
      time: '1시간 전',
      isRead: false,
      type: 'vote'
    },
    {
      id: '3',
      title: '시스템 점검 안내',
      message: '오늘 밤 12시부터 2시까지 시스템 점검이 있습니다.',
      time: '3시간 전',
      isRead: true,
      type: 'system'
    }
  ];

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

  const handleNotificationClick = (notification: Notification) => {
    // 알림 클릭 시 처리 로직 (나중에 구현)
    console.log('알림 클릭:', notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'funding':
        return '🎬';
      case 'vote':
        return '📊';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
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
              <button className="text-xs text-tertiary hover:text-primary transition-colors">
                모두 읽음
              </button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-80 overflow-y-auto">
            {mockNotifications.length > 0 ? (
              mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-BG-1 cursor-pointer hover:bg-BG-1 transition-colors ${
                    !notification.isRead ? 'bg-BG-1/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-primary' : 'text-secondary'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-tertiary mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-tertiary mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm text-tertiary">새로운 알림이 없습니다</p>
              </div>
            )}
          </div>

          {/* 푸터 */}
          {mockNotifications.length > 0 && (
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
