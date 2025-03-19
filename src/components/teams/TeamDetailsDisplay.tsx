
import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TeamDetailsDisplayProps {
  selectedTeam: any | null;
  children: React.ReactNode;
}

const TeamDetailsDisplay: React.FC<TeamDetailsDisplayProps> = ({ 
  selectedTeam, 
  children 
}) => {
  if (!selectedTeam) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="inline-block w-12 h-12 mb-4 text-muted-foreground" />
          <CardTitle>Select a Team</CardTitle>
          <CardDescription>Choose a team from the list to view its details and manage tasks.</CardDescription>
        </CardContent>
      </Card>
    );
  }

  return children;
};

export default TeamDetailsDisplay;
