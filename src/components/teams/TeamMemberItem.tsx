
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserX, MoreVertical, ShieldAlert, Shield, Mail } from 'lucide-react';
import { getUserInitials } from '@/lib/utils';
import { TeamService } from '@/services/TeamService';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface TeamMember {
  id: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    email?: string;
  };
}

interface TeamMemberItemProps {
  member: TeamMember;
  teamId: string;
  isCurrentUser: boolean;
  isCreator: boolean;
  onMemberRemoved: (memberId: string) => void;
  onRoleUpdated: (memberId: string, newRole: 'admin' | 'member') => void;
}

const TeamMemberItem: React.FC<TeamMemberItemProps> = ({ 
  member, 
  teamId, 
  isCurrentUser,
  isCreator,
  onMemberRemoved,
  onRoleUpdated
}) => {
  const [removing, setRemoving] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const { toast } = useToast();
  
  const fullName = member.profile 
    ? `${member.profile.firstName || ''} ${member.profile.lastName || ''}`.trim() 
    : 'Team Member';
  
  const initials = getUserInitials(fullName);
  
  const handleRemoveMember = async () => {
    try {
      setRemoving(true);
      const success = await TeamService.removeTeamMember(teamId, member.userId);
      
      if (success) {
        onMemberRemoved(member.id);
        toast({
          title: 'Member removed',
          description: `${fullName} has been removed from the team.`
        });
      } else {
        throw new Error('Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: 'Error',
        description: 'Could not remove member from team. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRemoving(false);
    }
  };
  
  const handleRoleUpdate = async (newRole: 'admin' | 'member') => {
    if (member.role === newRole) return;
    
    try {
      setUpdatingRole(true);
      const success = await TeamService.updateTeamMemberRole(teamId, member.userId, newRole);
      
      if (success) {
        onRoleUpdated(member.id, newRole);
        toast({
          title: 'Role updated',
          description: `${fullName} is now a team ${newRole}.`
        });
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Could not update member role. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingRole(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.profile?.avatarUrl || ''} alt={fullName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">
            {fullName}
            {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
          </div>
          <div className="text-sm text-muted-foreground">
            {member.profile?.email || ''}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant={member.role === 'admin' ? 'default' : 'outline'}>
          {member.role === 'admin' ? (
            <>
              <ShieldAlert className="mr-1 h-3 w-3" />
              Admin
            </>
          ) : (
            <>
              <Shield className="mr-1 h-3 w-3" />
              Member
            </>
          )}
        </Badge>
        
        {/* Only show actions if the current user is an admin and not for themselves if they're the creator */}
        {(isCreator || (member.role !== 'admin' && !isCurrentUser)) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {member.profile?.email && (
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </DropdownMenuItem>
              )}
              
              {!isCurrentUser && isCreator && (
                <>
                  <DropdownMenuSeparator />
                  
                  {member.role === 'member' ? (
                    <DropdownMenuItem onClick={() => handleRoleUpdate('admin')}>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Make Admin
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleRoleUpdate('member')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Remove Admin
                    </DropdownMenuItem>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <UserX className="mr-2 h-4 w-4" />
                        Remove from Team
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {fullName} from this team? 
                          They will lose access to all team tasks and resources.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveMember} disabled={removing}>
                          {removing ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default TeamMemberItem;
