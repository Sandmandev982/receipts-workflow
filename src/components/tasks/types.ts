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
  emailNotification?: boolean;
  notificationEmail?: string;
  progress?: number;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  tags?: string[];
  teamId?: string;
  created_at?: string;
  completed_at?: string;
  // SMART properties
  specific?: string;
  measurable?: string;
  achievable?: boolean;
  relevant?: string;
  time_bound?: boolean;
  // Additional properties
  has_subtasks?: boolean;
  has_reverse_plan?: boolean;
  start_date?: Date | null;
  // Additional SMART fields
  expected_outcome?: string;
  metrics?: string;
  resources_needed?: string;
  obstacles?: string;
  dependencies?: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'complete';
export type TaskPriority = 'high' | 'medium' | 'low';

// Subtask interface
export interface Subtask {
  id: string;
  parent_task_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Milestone for reverse planning
export interface Milestone {
  id: string;
  task_id: string;
  milestone_title: string;
  due_date: Date;
  description?: string;
  status: TaskStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Daily outcome
export interface DailyOutcome {
  id: string;
  date: Date;
  prev_day_tasks: Task[];
  today_focus: string[];
  accomplishments: string[];
  performance_rating: number;
  lessons_learned?: string;
  created_at: string;
  updated_at: string;
}

// Weekly outcome
export interface WeeklyOutcome {
  id: string;
  week_start_date: Date;
  work_goals: string[];
  work_steps: string[];
  education_goals: string[];
  education_steps: string[];
  health_goals: string[];
  health_steps: string[];
  reflection?: string;
  created_at: string;
  updated_at: string;
}

// Timer session
export interface TimerSession {
  id: string;
  task_id?: string;
  start_time: Date;
  end_time?: Date;
  completed: boolean;
  work_duration: number;
  break_duration: number;
  notes?: string;
  created_at: string;
}
