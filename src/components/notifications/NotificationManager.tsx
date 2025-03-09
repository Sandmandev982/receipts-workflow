
import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NotificationRow } from '@/types/database.types';
import { format } from 'date-fns';

export function NotificationManager() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification = payload.new as NotificationRow;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(count => count + 1);
          
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
  }, [toast]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
        
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      const removed = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (removed && !removed.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground"
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 md:w-96 p-4 shadow-lg z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto space-y-2">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 border rounded-md relative ${!notification.read ? 'bg-muted' : ''}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="pr-6">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.created_at)}
                      </span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">
                No notifications
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default NotificationManager;
