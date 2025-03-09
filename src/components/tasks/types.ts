
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'complete';
  dueDate: Date;
  dueTime?: string;
  reminderSet?: boolean;
  reminderTime?: string;
  progress?: number;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  tags?: string[];
  teamId?: string;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
