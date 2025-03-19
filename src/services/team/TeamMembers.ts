
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from './types';
import { NotificationService } from '../NotificationService';

export class TeamMembers {
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
