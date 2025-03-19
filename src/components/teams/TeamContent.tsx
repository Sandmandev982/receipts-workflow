
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamMembersView from './TeamMembersView';
import TeamSettings from './TeamSettings';
import TeamTasksList from './TeamTasksList';

interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface TeamContentProps {
  team: Team;
  teamMembers: any[];
  isCurrentUserAdmin: boolean;
  onMemberUpdated: () => void;
  onDeleteTeam: () => void;
}

const TeamContent: React.FC<TeamContentProps> = ({
  team,
  teamMembers,
  isCurrentUserAdmin,
  onMemberUpdated,
  onDeleteTeam
}) => {
  return (
    <Tabs defaultValue="tasks">
      <TabsList>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">
        <TeamTasksList teamId={team.id} teamName={team.name} />
      </TabsContent>
      <TabsContent value="members">
        <TeamMembersView
          teamId={team.id}
          teamName={team.name}
          members={teamMembers}
          isCurrentUserAdmin={isCurrentUserAdmin}
          onMemberUpdated={onMemberUpdated}
        />
      </TabsContent>
      <TabsContent value="settings">
        <TeamSettings
          team={team}
          isAdmin={isCurrentUserAdmin}
          onDeleteTeam={onDeleteTeam}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TeamContent;
