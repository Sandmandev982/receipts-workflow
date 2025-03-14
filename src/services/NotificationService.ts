
import { supabase } from '@/integrations/supabase/client';

export interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  taskId?: string;
  teamId?: string;
  type?: 'task' | 'message' | 'team' | 'system';
  actionUrl?: string;
}

export class NotificationService {
  static async createNotification(params: NotificationParams) {
    const { userId, title, message, taskId, teamId, type = 'system', actionUrl } = params;

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

  static async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    return !error;
  }

  // Task notification helpers
  static async notifyTaskAssigned(taskId: string, assignedToUserId: string, assignedByUserId: string, taskTitle: string) {
    return this.createNotification({
      userId: assignedToUserId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      taskId,
      type: 'task',
      actionUrl: `/tasks?id=${taskId}`
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

  static async notifyTaskDueSoon(taskId: string, userId: string, taskTitle: string, dueDate: string) {
    return this.createNotification({
      userId,
      title: 'Task Due Soon',
      message: `Your task "${taskTitle}" is due on ${dueDate}`,
      taskId,
      type: 'task',
      actionUrl: `/tasks?id=${taskId}`
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
      actionUrl: `/teams?id=${teamId}`
    });
  }
}
