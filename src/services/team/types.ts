
export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface CreateTeamParams {
  name: string;
  description?: string;
  created_by: string;
  initialMembers?: string[]; // Array of user IDs to add as members
}
