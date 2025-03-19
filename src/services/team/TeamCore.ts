
import { supabase } from '@/integrations/supabase/client';
import { Team, CreateTeamParams } from './types';
import { NotificationService } from '../NotificationService';

export class TeamCore {
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
}
