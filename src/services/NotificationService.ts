
import { supabase } from '@/integrations/supabase/client';

export interface NotificationParams {
  userId: string;
  title: string;
  message: string;
}

export class NotificationService {
  static async createNotification(params: NotificationParams) {
    const { userId, title, message } = params;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    
    return data;
  }

  static async fetchNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data;
  }

  static async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    return !error;
  }

  static async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    return !error;
  }
}
