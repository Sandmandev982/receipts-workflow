
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserX, UserCog, Mail } from 'lucide-react';
import { getUserInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TeamMemberItemProps {
  member: {
    id: string;
    name: string;
    initials?: string;
    avatar?: string;
  };
  role: 'admin' | 'member';
  onRemove: (memberId: string) => void;
  onChangeRole: (memberId: string, newRole: 'admin' | 'member') => void;
}

const TeamMemberItem: React.FC<TeamMemberItemProps> = ({ member, role, onRemove, onChangeRole }) => {
  const { toast } = useToast();

  const handleRemove = () => {
    onRemove(member.id);
    toast({
      title: "Team Member Removed",
      description: `${member.name} has been removed from the team.`,
    });
  };

  const handleChangeRole = (newRole: 'admin' | 'member') => {
    onChangeRole(member.id, newRole);
    toast({
      title: "Team Member Role Changed",
      description: `${member.name}'s role has been updated to ${newRole}.`,
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <Avatar>
          {member.avatar ? (
            <AvatarImage src={member.avatar} alt={member.name} />
          ) : (
            <AvatarFallback>{member.initials || getUserInitials(member.name)}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="text-sm font-medium">{member.name}</div>
          <div className="text-xs text-muted-foreground">
            {role === 'admin' ? (
              <Badge variant="secondary">Admin</Badge>
            ) : (
              'Member'
            )}
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleChangeRole(role === 'admin' ? 'member' : 'admin')}>
            <UserCog className="mr-2 h-4 w-4" />
            {role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleRemove} className="text-red-600 focus:text-red-600">
            <UserX className="mr-2 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TeamMemberItem;
