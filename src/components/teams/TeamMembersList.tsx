
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PenSquare, Trash2, ShieldAlert, UserMinus, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TeamService } from '@/services/TeamService';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamMember {
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
      {members.map((member) => {
        const isCurrentUser = member.user_id === user?.id;
        const memberName = `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim() || 'Unknown User';
        const initials = memberName !== 'Unknown User'
          ? `${member.profile?.first_name?.[0] || ''}${member.profile?.last_name?.[0] || ''}`.toUpperCase()
          : 'UN';
        
        return (
          <div key={member.id} className="flex items-center justify-between py-3 px-4 border-b last:border-0">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={member.profile?.avatar_url || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{memberName}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  {member.role === 'admin' ? (
                    <>
                      <ShieldAlert className="h-3 w-3 mr-1 text-primary" />
                      Admin
                    </>
                  ) : (
                    'Member'
                  )}
                </div>
              </div>
            </div>
            
            {isCurrentUserAdmin && !isCurrentUser && (
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <PenSquare className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(member.user_id, 'admin')}
                      disabled={member.role === 'admin'}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(member.user_id, 'member')}
                      disabled={member.role === 'member'}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setMemberToRemove(member);
                    setOpenRemoveDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
      
      <AlertDialog open={openRemoveDialog} onOpenChange={setOpenRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? They will no longer have access to this team's tasks and conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamMembersList;
