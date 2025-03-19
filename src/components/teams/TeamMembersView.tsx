
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import TeamMembersList from './TeamMembersList';
import TeamInviteForm from './TeamInviteForm';

interface TeamMembersViewProps {
  teamId: string;
  teamName: string;
  members: any[];
  isCurrentUserAdmin: boolean;
  onMemberUpdated: () => void;
}

const TeamMembersView: React.FC<TeamMembersViewProps> = ({
  teamId,
  teamName,
  members,
  isCurrentUserAdmin,
  onMemberUpdated
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage team members and their roles</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TeamMembersList 
              teamId={teamId}
              members={members}
              isCurrentUserAdmin={isCurrentUserAdmin}
              onMemberUpdated={onMemberUpdated}
            />
          </CardContent>
        </Card>
      </div>
      
      {isCurrentUserAdmin && (
        <div className="md:col-span-1">
          <TeamInviteForm 
            teamId={teamId}
            teamName={teamName}
            onInviteSuccess={onMemberUpdated}
          />
        </div>
      )}
    </div>
  );
};

export default TeamMembersView;
