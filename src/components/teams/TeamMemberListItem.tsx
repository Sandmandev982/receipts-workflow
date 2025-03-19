
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Trash2, PenSquare, Shield, UserMinus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/services/team/types';

interface TeamMemberListItemProps {
  member: TeamMember;
  isCurrentUser: boolean;
  isCurrentUserAdmin: boolean;
  onRemoveMember: (member: TeamMember) => void;
  onRoleChange: (userId: string, newRole: 'admin' | 'member') => void;
}

const TeamMemberListItem: React.FC<TeamMemberListItemProps> = ({
  member,
  isCurrentUser,
  isCurrentUserAdmin,
  onRemoveMember,
  onRoleChange,
}) => {
  const memberName = `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim() || 'Unknown User';
  const initials = memberName !== 'Unknown User'
    ? `${member.profile?.first_name?.[0] || ''}${member.profile?.last_name?.[0] || ''}`.toUpperCase()
    : 'UN';

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-0">
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
                onClick={() => onRoleChange(member.user_id, 'admin')}
                disabled={member.role === 'admin'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRoleChange(member.user_id, 'member')}
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
            onClick={() => onRemoveMember(member)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamMemberListItem;
