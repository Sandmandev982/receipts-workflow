
import { supabase } from '@/integrations/supabase/client';
import { TeamRow, TeamMemberRow, TeamTaskRow } from '@/types/database.types';

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Team related API calls
export async function getUserTeams(userId: string): Promise<Team[]> {
  try {
    // Fetch team memberships
    const { data: membershipData, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (membershipError) throw membershipError;

    if (membershipData && membershipData.length > 0) {
      const teamIds = membershipData.map(item => item.team_id);
      
      // Fetch team details
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);

      if (teamsError) throw teamsError;
      
      return teamsData || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return [];
  }
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export async function createTeam(name: string, description: string, userId: string): Promise<Team | null> {
  try {
    // Create the team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert([{ name, description, created_by: userId }])
      .select()
      .single();

    if (teamError) throw teamError;
    
    // Add the creator as an admin
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{ team_id: teamData.id, user_id: userId, role: 'admin' }]);

    if (memberError) throw memberError;
    
    return teamData;
  } catch (error) {
    console.error('Error creating team:', error);
    return null;
  }
}

export async function addTeamMember(teamId: string, userId: string, role: 'admin' | 'member'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_members')
      .insert([{ team_id: teamId, user_id: userId, role }]);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error adding team member:', error);
    return false;
  }
}

export async function assignTaskToTeam(taskId: string, teamId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_tasks')
      .insert([{ task_id: taskId, team_id: teamId }]);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error assigning task to team:', error);
    return false;
  }
}

export async function getTeamTasks(teamId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('team_tasks')
      .select(`
        task_id,
        tasks:task_id (*)
      `)
      .eq('team_id', teamId);

    if (error) throw error;
    
    // Extract the task data from the nested structure
    return data?.map(item => item.tasks) || [];
  } catch (error) {
    console.error('Error fetching team tasks:', error);
    return [];
  }
}
