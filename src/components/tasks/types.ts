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
  assignedTo?: string | {
    id: string;
    name: string;
    initials?: string;
    avatar?: string;
  };
  emailNotification?: boolean;
  notificationEmail?: string;
  calendar_event_id?: string;
  
  // SMART task fields
  specific?: string;
  measurable?: string;
  achievable?: boolean;
  relevant?: string;
  time_bound?: boolean;
  
  // Additional fields
  start_date?: Date;
  has_subtasks?: boolean;
  has_reverse_plan?: boolean;
  
  // Extended SMART fields
  expected_outcome?: string;
  metrics?: string;
  resources_needed?: string;
  obstacles?: string;
  dependencies?: string;
  
  // Database timestamp fields
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  dueTime?: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  progress: number;
  tags?: string;
  teamId?: string;
  assignedTo?: string;
  emailNotification?: boolean;
  notificationEmail?: string;
  
  // SMART task fields
  specific?: string;
  measurable?: string;
  achievable?: boolean;
  relevant?: string;
  time_bound?: boolean;
  
  // Additional fields
  start_date?: Date;
  has_subtasks?: boolean;
  has_reverse_plan?: boolean;
  
  // Extended SMART fields
  expected_outcome?: string;
  metrics?: string;
  resources_needed?: string;
  obstacles?: string;
  dependencies?: string;
}

// Add DailyOutcome type for productivity features
export interface DailyOutcome {
  id?: string;
  user_id: string;
  date: Date;
  prev_day_tasks?: Task[];
  today_focus: string[];
  accomplishments: string[];
  performance_rating: number;
  lessons_learned?: string;
  created_at?: string;
  updated_at?: string;
}

// Add WeeklyOutcome type for productivity features
export interface WeeklyOutcome {
  id?: string;
  user_id: string;
  week_start_date: Date;
  work_goals: string[];
  work_steps: string[];
  education_goals: string[];
  education_steps: string[];
  health_goals: string[];
  health_steps: string[];
  reflection?: string;
  created_at?: string;
  updated_at?: string;
}

// Add Subtask type
export interface Subtask {
  id: string;
  parent_task_id: string;
  title: string;
  description?: string;
  status: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// Add Milestone type
export interface Milestone {
  id: string;
  task_id: string;
  milestone_title: string;
  due_date: Date;
  description?: string;
  status: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// Add TimerSession type
export interface TimerSession {
  id: string;
  user_id: string;
  task_id?: string;
  start_time: Date;
  end_time?: Date;
  completed: boolean;
  work_duration: number;
  break_duration: number;
  notes?: string;
  created_at?: string;
  task?: Task;
}
