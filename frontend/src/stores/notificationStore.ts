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
        set({ 
          notifications,
          hasUnread: notifications.some(n => !n.isRead)
        });
      },

      addNotification: (notification) => {
        const { notifications } = get();
        const newNotifications = [notification, ...notifications];
        
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
