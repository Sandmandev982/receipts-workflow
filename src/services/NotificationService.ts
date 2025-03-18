
import { supabase } from '@/integrations/supabase/client';

export interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  taskId?: string;
  teamId?: string;
  type?: 'task' | 'message' | 'team' | 'system';
  actionUrl?: string;
  // Added fields for enhanced notification settings
  priority?: 'low' | 'normal' | 'high';
  sendEmail?: boolean;
  emailAddress?: string;
}

export class NotificationService {
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
          await supabase.functions.invoke('send-notification-email', {
            body: JSON.stringify({
              email: emailAddress,
              subject: title,
              message: message,
              taskId,
              actionUrl
            }),
          });
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Continue with the function - don't throw, as the in-app notification succeeded
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  static async fetchNotifications(userId: string, options?: { 
    limit?: number, 
    unreadOnly?: boolean,
    type?: 'task' | 'message' | 'team' | 'system' 
  }) {
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

  // Task notification helpers
  static async notifyTaskAssigned(taskId: string, assignedToUserId: string, assignedByUserId: string, taskTitle: string) {
    return this.createNotification({
      userId: assignedToUserId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      taskId,
      type: 'task',
      actionUrl: `/tasks?id=${taskId}`,
      priority: 'high'
    });
  }

  static async notifyTaskCompleted(taskId: string, completedByUserId: string, taskTitle: string, teamId?: string, teamMembers?: string[]) {
    // If there's a team, notify all team members
    if (teamId && teamMembers && teamMembers.length > 0) {
      const promises = teamMembers
        .filter(memberId => memberId !== completedByUserId) // Don't notify the completer
        .map(memberId => 
          this.createNotification({
            userId: memberId,
            title: 'Task Completed',
            message: `Task "${taskTitle}" has been completed`,
            taskId,
            teamId,
            type: 'task',
            actionUrl: `/tasks?id=${taskId}`
          })
        );
      
      await Promise.all(promises);
      return true;
    }
    
    // If no team, just return true as there's no one to notify
    return true;
  }

  static async notifyTaskDueSoon(taskId: string, userId: string, taskTitle: string, dueDate: string, emailNotification?: boolean, emailAddress?: string) {
    return this.createNotification({
      userId,
      title: 'Task Due Soon',
      message: `Your task "${taskTitle}" is due on ${dueDate}`,
      taskId,
      type: 'task',
      actionUrl: `/tasks?id=${taskId}`,
      priority: 'high',
      sendEmail: emailNotification,
      emailAddress
    });
  }

  static async notifyTaskOverdue(taskId: string, userId: string, taskTitle: string, dueDate: string, emailNotification?: boolean, emailAddress?: string) {
    return this.createNotification({
      userId,
      title: 'Task Overdue',
      message: `Your task "${taskTitle}" was due on ${dueDate} and is now overdue`,
      taskId,
      type: 'task',
      actionUrl: `/tasks?id=${taskId}`,
      priority: 'high',
      sendEmail: emailNotification,
      emailAddress
    });
  }

  static async notifyMessageReceived(messageId: string, userId: string, senderName: string, teamId?: string, teamName?: string) {
    return this.createNotification({
      userId,
      title: teamId ? `New message in ${teamName || 'team'}` : 'New direct message',
      message: `You have received a new message from ${senderName}`,
      teamId,
      type: 'message',
      actionUrl: teamId ? `/messages?team=${teamId}` : `/messages`
    });
  }

  static async notifyTeamInvite(userId: string, teamId: string, teamName: string, invitedByName: string) {
    return this.createNotification({
      userId,
      title: 'Team Invitation',
      message: `${invitedByName} has invited you to join the team "${teamName}"`,
      teamId,
      type: 'team',
      actionUrl: `/teams?id=${teamId}`,
      priority: 'high'
    });
  }
}
