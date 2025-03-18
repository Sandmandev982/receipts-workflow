
import { supabase } from '@/integrations/supabase/client';

// Define the NotificationParams interface directly here
// This avoids circular imports with other modules
export interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  taskId?: string;
  teamId?: string;
  type?: 'task' | 'message' | 'team' | 'system';
  actionUrl?: string;
  priority?: 'normal' | 'high' | 'low';
  sendEmail?: boolean;
  emailAddress?: string;
}

export interface NotificationFetchOptions {
  unreadOnly?: boolean;
  type?: 'task' | 'message' | 'team' | 'system';
  limit?: number;
}

/**
 * Core notification functions for creating and managing notifications
 */
export class NotificationCore {
  /**
   * Create a new notification in the database with optional email notification
   */
  static async createNotification(params: NotificationParams) {
    const { 
      userId, 
      title, 
      message, 
      taskId, 
      teamId, 
      type = 'system', 
      actionUrl,
      priority = 'normal',
      sendEmail = false,
      emailAddress
    } = params;

    try {
      // Create in-app notification
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          task_id: taskId,
          team_id: teamId,
          type,
          action_url: actionUrl,
          read: false,
          priority
        })
        .select()
        .single();

      if (error) throw error;
      
      // If email notification is requested, send it using Supabase edge function
      if (sendEmail && emailAddress) {
        try {
          // Use a simplified approach to avoid type errors
          const emailParams = {
            email: emailAddress,
            subject: title,
            message: message,
            taskId,
            actionUrl
          };
          
          await supabase.functions.invoke('send-notification-email', {
            body: emailParams,
          });
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Fetch notifications for a user with optional filters
   */
  static async fetchNotifications(userId: string, options?: NotificationFetchOptions) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      // Apply filters based on options
      if (options?.unreadOnly) {
        query = query.eq('read', false);
      }
      
      if (options?.type) {
        query = query.eq('type', options.type);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Clear all notifications for a user
   */
  static async clearAllNotifications(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  }
}
