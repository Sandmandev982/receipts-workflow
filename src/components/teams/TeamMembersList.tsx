
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TeamService } from '@/services/TeamService';
import { useToast } from '@/hooks/use-toast';
import { TeamMember } from '@/services/team/types';
import TeamMemberListItem from './TeamMemberListItem';
import RemoveMemberDialog from './RemoveMemberDialog';

interface TeamMembersListProps {
  teamId: string;
  members: TeamMember[];
  isCurrentUserAdmin: boolean;
  onMemberUpdated: () => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  teamId, 
  members, 
  isCurrentUserAdmin,
  onMemberUpdated 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const handleRemoveMember = async () => {
    if (!user || !memberToRemove) return;
    
    try {
      const success = await TeamService.removeTeamMember(
        teamId, 
        memberToRemove.user_id
      );
      
      if (success) {
        toast({
          title: 'Member removed',
          description: 'Team member has been removed successfully'
        });
        onMemberUpdated();
      } else {
        throw new Error('Failed to remove team member');
      }
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove team member',
        variant: 'destructive'
      });
    } finally {
      setOpenRemoveDialog(false);
      setMemberToRemove(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    if (!user) return;
    
    try {
      const success = await TeamService.updateTeamMemberRole(
        teamId,
        memberId,
        newRole
      );
      
      if (success) {
        toast({
          title: 'Role updated',
          description: `Member role has been updated to ${newRole}`
        });
        onMemberUpdated();
      } else {
        throw new Error('Failed to update member role');
      }
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update member role',
        variant: 'destructive'
      });
    }
  };

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No members in this team yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {members.map((member) => (
        <TeamMemberListItem
          key={member.id}
          member={member}
          isCurrentUser={member.user_id === user?.id}
          isCurrentUserAdmin={isCurrentUserAdmin}
          onRemoveMember={(member) => {
            setMemberToRemove(member);
            setOpenRemoveDialog(true);
          }}
          onRoleChange={handleRoleChange}
        />
      ))}
      
      <RemoveMemberDialog
        open={openRemoveDialog}
        onOpenChange={setOpenRemoveDialog}
        onConfirm={handleRemoveMember}
      />
    </div>
  );
};

export default TeamMembersList;
