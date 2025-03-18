
export interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  taskId?: string;
  teamId?: string;
  type?: 'task' | 'message' | 'team' | 'system';
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high';
  sendEmail?: boolean;
  emailAddress?: string;
}

export interface NotificationFetchOptions {
  limit?: number;
  unreadOnly?: boolean;
  type?: 'task' | 'message' | 'team' | 'system';
}
