
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
  priority?: NotificationPriority;
}

export type NotificationPriority = 'low' | 'normal' | 'high';
export type NotificationType = 'task' | 'message' | 'team' | 'system';
export type NotificationStatus = 'read' | 'unread';

export interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  taskId?: string;
  teamId?: string;
  type?: NotificationType;
  actionUrl?: string;
  priority?: NotificationPriority;
  sendEmail?: boolean;
  emailAddress?: string;
}

export interface NotificationCreateParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  teamId?: string;
  taskId?: string;
  actionUrl?: string;
  sendEmail?: boolean;
  emailAddress?: string;
}

export interface NotificationFetchOptions {
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}
