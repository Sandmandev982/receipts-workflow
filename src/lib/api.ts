
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

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface CreateTeamParams {
  name: string;
  description?: string;
  created_by: string;
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
        profiles:profiles(
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
      profile: {
        first_name: member.profiles?.first_name || null,
        last_name: member.profiles?.last_name || null,
        avatar_url: member.profiles?.avatar_url || null
      }
    }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

export const getTeams = async (userId: string): Promise<Team[]> => {
  try {
    // Get teams the user is a member of
    const { data: membershipData, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (membershipError) throw membershipError;

    if (!membershipData || membershipData.length === 0) {
      return [];
    }

    // Get the team details
    const teamIds = membershipData.map(item => item.team_id);
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    if (teamsError) throw teamsError;

    return teamsData || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

export const createTeam = async (params: CreateTeamParams): Promise<Team> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: params.name,
        description: params.description || null,
        created_by: params.created_by
      })
      .select()
      .single();

    if (error) throw error;

    // Also add the creator as a team member with admin role
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: data.id,
        user_id: params.created_by,
        role: 'admin'
      });

    if (memberError) throw memberError;

    return data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};
