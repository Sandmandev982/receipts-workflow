
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface TeamSettingsProps {
  team: Team;
  isAdmin: boolean;
  onDeleteTeam: () => void;
}

const TeamSettings: React.FC<TeamSettingsProps> = ({ team, isAdmin, onDeleteTeam }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Settings</CardTitle>
        <CardDescription>Manage team settings</CardDescription>
      </CardHeader>
      <CardContent>
        {isAdmin ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Team Name</h3>
              <p className="text-sm text-muted-foreground">{team.name}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{team.description || 'No description provided'}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Created</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(team.created_at).toLocaleDateString()} at {' '}
                {new Date(team.created_at).toLocaleTimeString()}
              </p>
            </div>
            <div className="pt-4">
              <Button variant="destructive" onClick={onDeleteTeam}>Delete Team</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Badge variant="secondary">Member</Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              Only team admins can modify team settings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamSettings;
