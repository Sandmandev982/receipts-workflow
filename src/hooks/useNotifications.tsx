
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/services/NotificationService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  user_id: string;
  task_id?: string;
  team_id?: string;
  type?: 'task' | 'message' | 'team' | 'system';
  action_url?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const data = await NotificationService.fetchNotifications(user.id);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
      
      setLoading(false);
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          // Add the new notification to state
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;

    const success = await NotificationService.markAsRead(id);
    
    if (success) {
      setNotifications(prev => 
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    const success = await NotificationService.markAllAsRead(user.id);
    
    if (success) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    if (!user) return;

    const success = await NotificationService.deleteNotification(id);
    
    if (success) {
      const wasUnread = notifications.find(n => n.id === id && !n.read);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Navigate to the action URL of a notification
  const handleNotificationAction = (notification: Notification) => {
    // Mark as read first
    markAsRead(notification.id);
    
    // If there's an action URL, navigate to it
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationAction
  };
};
