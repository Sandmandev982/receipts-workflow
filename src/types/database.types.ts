export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'complete';
  due_date: string | null;
  due_time: string | null;
  reminder_set: boolean;
  reminder_time: string | null;
  progress: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamRow {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface TeamTaskRow {
  id: string;
  team_id: string;
  task_id: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface DailyOutcomeRow {
  id: string;
  user_id: string;
  date: string;
  prev_day_tasks: any;
  today_focus: string[];
  accomplishments: string[];
  performance_rating: number;
  lessons_learned: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyOutcomeRow {
  id: string;
  user_id: string;
  week_start_date: string;
  work_goals: string[];
  work_steps: string[];
  education_goals: string[];
  education_steps: string[];
  health_goals: string[];
  health_steps: string[];
  reflection: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskBreakdownRow {
  id: string;
  parent_task_id: string;
  title: string;
  description: string | null;
  status: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ReversePlanningRow {
  id: string;
  task_id: string;
  milestone_title: string;
  due_date: string;
  description: string | null;
  status: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TimerSessionRow {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  completed: boolean;
  work_duration: number;
  break_duration: number;
  notes: string | null;
  created_at: string;
}
