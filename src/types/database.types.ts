
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
