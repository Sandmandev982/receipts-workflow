
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Bell, Check, CheckCheck, MessageSquare, Users, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationList = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    handleNotificationAction
  } = useNotifications();

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />;
      case 'team':
        return <Users className="h-4 w-4 mr-2 text-green-500" />;
      case 'task':
        return <Calendar className="h-4 w-4 mr-2 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center p-6">
        <Bell className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
        <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2 px-4">
        <div className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Mark all as read
          </Button>
        )}
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 p-2">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={notification.read ? 'bg-background' : 'bg-muted/30 border-primary/20'}
              onClick={() => notification.action_url && handleNotificationAction(notification)}
              style={{ cursor: notification.action_url ? 'pointer' : 'default' }}
            >
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  {getNotificationIcon(notification.type)}
                  {notification.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </CardContent>
              {!notification.read && (
                <CardFooter className="pt-0 px-4 pb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Mark as read
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
