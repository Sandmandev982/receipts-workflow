
import React, { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Task } from '@/components/tasks/TaskCard';
import { format, isToday, addMinutes, isAfter } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  taskId?: string;
}

interface NotificationCenterProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ tasks, onTaskUpdate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications based on tasks and their due dates/reminders
  useEffect(() => {
    const newNotifications: Notification[] = [];
    
    tasks.forEach(task => {
      if (task.status === 'complete') return;
      
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      
      // Add notification for tasks due today
      if (isToday(dueDate) && task.status !== 'complete') {
        newNotifications.push({
          id: `${task.id}-due-today`,
          title: 'Task Due Today',
          message: `"${task.title}" is due today${task.dueTime ? ` at ${task.dueTime}` : ''}`,
          time: new Date(),
          read: false,
          taskId: task.id,
        });
      }
      
      // Add notification for tasks with reminders
      if (task.reminderSet && task.reminderTime) {
        const reminderOffset = task.reminderTime.includes('minutes') 
          ? parseInt(task.reminderTime) 
          : task.reminderTime.includes('hour') 
            ? parseInt(task.reminderTime) * 60 
            : 24 * 60; // default to 1 day in minutes
        
        const reminderTime = addMinutes(dueDate, -reminderOffset);
        
        if (isAfter(now, reminderTime) && task.status !== 'complete') {
          newNotifications.push({
            id: `${task.id}-reminder`,
            title: 'Task Reminder',
            message: `Reminder for "${task.title}" due ${format(dueDate, 'PPP')}${task.dueTime ? ` at ${task.dueTime}` : ''}`,
            time: reminderTime,
            read: false,
            taskId: task.id,
          });
        }
      }
    });
    
    // Only set if there are new notifications to avoid infinite loops
    if (newNotifications.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));
        
        // Show toast for new notifications
        filteredNew.forEach(notification => {
          toast(notification.title, {
            description: notification.message,
            action: {
              label: "View",
              onClick: () => {
                setOpen(true);
                if (notification.taskId) {
                  onTaskUpdate(notification.taskId);
                }
              },
            },
          });
        });
        
        return [...prev, ...filteredNew].sort((a, b) => 
          b.time.getTime() - a.time.getTime()
        );
      });
    }
  }, [tasks, onTaskUpdate]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs"
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllNotifications}
                className="h-7 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 hover:bg-muted flex items-start gap-2 ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => markAsRead(notification.id)}
                          className="h-5 w-5"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeNotification(notification.id)}
                        className="h-5 w-5"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {format(notification.time, 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No notifications</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
