
import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from './NotificationService';

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

export class TeamService {
  static async fetchTeams(userId: string): Promise<Team[]> {
    try {
      // Get all teams where the user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);
        
      if (membershipError) throw membershipError;
      
      if (!membershipData || membershipData.length === 0) {
        return [];
      }
      
      // Get the details for each team
      const teamIds = membershipData.map(item => item.team_id);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  static async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching team:', error);
      return null;
    }
  }

  static async createTeam(params: CreateTeamParams): Promise<Team | null> {
    try {
      // Create the team
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
      
      // Add the creator as a team admin
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: params.created_by,
          role: 'admin'
        });
        
      if (memberError) throw memberError;
      
      // Add initial members if provided
      if (params.initialMembers && params.initialMembers.length > 0) {
        const memberInserts = params.initialMembers.map(userId => ({
          team_id: data.id,
          user_id: userId,
          role: 'member'
        }));
        
        const { error: batchMemberError } = await supabase
          .from('team_members')
          .insert(memberInserts);
          
        if (batchMemberError) throw batchMemberError;
        
        // Send notifications to all new members
        for (const userId of params.initialMembers) {
          await NotificationService.createNotification({
            userId,
            title: 'Added to Team',
            message: `You have been added to the team "${params.name}"`,
            teamId: data.id,
            type: 'team'
          });
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error creating team:', error);
      return null;
    }
  }

  static async updateTeam(team: Team): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: team.name,
          description: team.description
        })
        .eq('id', team.id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating team:', error);
      return false;
    }
  }

  static async deleteTeam(teamId: string): Promise<boolean> {
    try {
      // First, delete all team_tasks associated with this team
      const { error: teamTasksError } = await supabase
        .from('team_tasks')
        .delete()
        .eq('team_id', teamId);
        
      if (teamTasksError) throw teamTasksError;
      
      // Next, delete all team members
      const { error: membersError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId);
        
      if (membersError) throw membersError;
      
      // Finally, delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      return false;
    }
  }

  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      // First, get all team members for this team
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('id, team_id, user_id, role, joined_at')
        .eq('team_id', teamId);
        
      if (memberError) throw memberError;
      
      if (!memberData || memberData.length === 0) {
        return [];
      }
      
      // Get the profiles for all team members
      const userIds = memberData.map(member => member.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Map the team members with their profile data
      return memberData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        return {
          id: member.id,
          user_id: member.user_id,
          team_id: member.team_id,
          role: member.role as 'admin' | 'member',
          joined_at: member.joined_at,
          profile: profile ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  static async addTeamMember(teamId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<boolean> {
    try {
      // Check if the user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existingMember) {
        // User is already a member, update their role if needed
        const { error } = await supabase
          .from('team_members')
          .update({ role })
          .eq('id', existingMember.id);
          
        if (error) throw error;
      } else {
        // Add the user as a new member
        const { error } = await supabase
          .from('team_members')
          .insert({
            team_id: teamId,
            user_id: userId,
            role
          });
          
        if (error) throw error;
        
        // Get team name for notification
        const { data: team } = await supabase
          .from('teams')
          .select('name')
          .eq('id', teamId)
          .single();
          
        // Send notification to the added user
        await NotificationService.createNotification({
          userId,
          title: 'Added to Team',
          message: `You have been added to the team "${team?.name || 'Unknown'}"`,
          teamId,
          type: 'team'
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      return false;
    }
  }

  static async removeTeamMember(teamId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      return false;
    }
  }

  static async updateTeamMemberRole(teamId: string, userId: string, role: 'admin' | 'member'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', teamId)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating team member role:', error);
      return false;
    }
  }
}
