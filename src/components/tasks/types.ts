
export type TaskStatus = 'pending' | 'in-progress' | 'complete';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  dueTime?: string;
  reminderSet?: boolean;
  reminderTime?: string;
  progress: number;
  tags?: string[];
  teamId?: string;
  assignedTo?: string;
  emailNotification?: boolean;
  notificationEmail?: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  dueTime?: string;
  reminderSet: boolean;
  reminderTime?: string;
  progress: number;
  tags?: string[];
  teamId?: string;
  assignedTo?: string;
  emailNotification?: boolean;
  notificationEmail?: string;
}
