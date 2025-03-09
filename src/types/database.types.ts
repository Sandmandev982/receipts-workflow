
export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'complete';
  due_date: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
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
