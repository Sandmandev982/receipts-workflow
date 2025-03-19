
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

interface TeamListProps {
  teams: Team[];
  selectedTeam: Team | null;
  onSelectTeam: (team: Team) => void;
  loading: boolean;
}

const TeamList: React.FC<TeamListProps> = ({ 
  teams, 
  selectedTeam, 
  onSelectTeam, 
  loading 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Teams</CardTitle>
        <CardDescription>Select a team to view details</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : teams.length > 0 ? (
          <div className="divide-y divide-border">
            {teams.map((team) => (
              <button
                key={team.id}
                className={`w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground ${selectedTeam?.id === team.id ? 'bg-accent text-accent-foreground' : ''}`}
                onClick={() => onSelectTeam(team)}
              >
                {team.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No teams yet. Create one to get started!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamList;
