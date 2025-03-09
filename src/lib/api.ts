import { supabase } from '@/integrations/supabase/client';
import { Task, TaskPriority, TaskStatus } from '@/components/tasks/types';
import { format } from 'date-fns';

// Function to format a date into 'yyyy-MM-dd' format for Supabase
const formatDateForSupabase = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Function to parse a date string from Supabase into a Date object
const parseDateFromSupabase = (dateString: string | null): Date | null => {
  return dateString ? new Date(dateString) : null;
};

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        team_id,
        user_id,
        role,
        joined_at,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId);

    if (error) throw error;

    return data.map(member => ({
      id: member.id,
      team_id: member.team_id,
      user_id: member.user_id,
      role: member.role as 'admin' | 'member',
      joined_at: member.joined_at,
      profile: member.profiles || {
        first_name: null,
        last_name: null,
        avatar_url: null
      }
    }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};
