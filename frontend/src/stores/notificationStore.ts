import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NotificationEventDto } from '@/types/notification';

interface NotificationState {
  notifications: NotificationEventDto[];
  isConnected: boolean;
  hasUnread: boolean;
}

interface NotificationStore extends NotificationState {
  // Actions
  setNotifications: (notifications: NotificationEventDto[]) => void;
  addNotification: (notification: NotificationEventDto) => void;
  markAsRead: (eventId: string) => void;
  markAllAsRead: () => void;
  setConnected: (connected: boolean) => void;
  clearNotifications: () => void;
  
  // Computed
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      isConnected: false,
      hasUnread: false,

      // Actions
      setNotifications: (notifications) => {
        // 중복된 eventId 제거 (같은 eventId를 가진 알림 중 가장 최근 것만 유지)
        const uniqueNotifications = notifications.reduce((acc, current) => {
          const existingIndex = acc.findIndex(n => n.eventId === current.eventId);
          if (existingIndex === -1) {
            acc.push(current);
          } else {
            // 같은 eventId가 있으면 더 최근 timestamp를 가진 것으로 교체
            const existing = acc[existingIndex];
            if (new Date(current.timestamp) > new Date(existing.timestamp)) {
              acc[existingIndex] = current;
            }
          }
          return acc;
        }, [] as NotificationEventDto[]);
        
        // 초기 데이터는 모두 읽음 처리
        const readNotifications = uniqueNotifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        
        set({ 
          notifications: readNotifications,
          hasUnread: false // 초기 데이터는 읽음 처리되므로 hasUnread를 false로 설정
        });
      },

      addNotification: (notification) => {
        const { notifications } = get();
        
        // 중복된 eventId가 있는지 확인하고 제거
        const filteredNotifications = notifications.filter(n => n.eventId !== notification.eventId);
        const newNotifications = [notification, ...filteredNotifications];
        
        // 알림 개수 제한 (최대 100개)
        const limitedNotifications = newNotifications.slice(0, 100);
        
        set({ 
          notifications: limitedNotifications,
          hasUnread: true // 새 알림이 추가되면 읽지 않음으로 설정
        });
      },

      markAsRead: (eventId) => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => 
          notification.eventId === eventId 
            ? { ...notification, isRead: true }
            : notification
        );
        
        set({ 
          notifications: updatedNotifications,
          hasUnread: updatedNotifications.some(n => !n.isRead)
        });
      },

      markAllAsRead: () => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => 
          ({ ...notification, isRead: true })
        );
        
        set({ 
          notifications: updatedNotifications,
          hasUnread: false
        });
      },

      setConnected: (connected) => {
        set({ isConnected: connected });
      },

      clearNotifications: () => {
        set({ 
          notifications: [],
          hasUnread: false,
          isConnected: false
        });
      },

      // Computed
      getUnreadCount: () => {
        const { notifications } = get();
        return notifications.filter(n => !n.isRead).length;
      }
    }),
    {
      name: 'notification-storage', // localStorage key
      partialize: (state) => ({ 
        notifications: state.notifications,
        hasUnread: state.hasUnread 
      }), // isConnected는 저장하지 않음
    }
  )
);
