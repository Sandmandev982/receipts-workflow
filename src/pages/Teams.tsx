
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { TeamService } from '@/services/TeamService';
import TeamList from '@/components/teams/TeamList';
import TeamDetailsDisplay from '@/components/teams/TeamDetailsDisplay';
import TeamContent from '@/components/teams/TeamContent';
import CreateTeamDialog from '@/components/teams/CreateTeamDialog';

type TeamFormValues = {
  name: string;
  description?: string;
};

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers();
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const teamsData = await TeamService.fetchTeams(user.id);
      setTeams(teamsData);
      
      // If there's at least one team and no team currently selected, select the first one
      if (teamsData.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsData[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    if (!user || !selectedTeam) return;
    
    try {
      const members = await TeamService.getTeamMembers(selectedTeam.id);
      setTeamMembers(members);
      
      // Check if current user is admin in this team
      const currentUserRole = members.find(member => member.user_id === user.id)?.role;
      setIsCurrentUserAdmin(currentUserRole === 'admin');
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    }
  };

  const handleTeamCreate = async (values: TeamFormValues) => {
    if (!user) return;

    try {
      const newTeam = await TeamService.createTeam({
        name: values.name,
        description: values.description,
        created_by: user.id,
      });

      if (newTeam) {
        await fetchTeams();
        setSelectedTeam(newTeam);
        toast.success("Team created successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsTeamDialogOpen(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam || !isCurrentUserAdmin) return;
    
    try {
      const success = await TeamService.deleteTeam(selectedTeam.id);
      if (success) {
        toast.success("Team deleted successfully");
        setSelectedTeam(null);
        fetchTeams();
      } else {
        throw new Error("Failed to delete team");
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete team');
    }
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teams</h1>
          <CreateTeamDialog
            open={isTeamDialogOpen}
            onOpenChange={setIsTeamDialogOpen}
            onSubmit={handleTeamCreate}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="md:col-span-1">
            <TeamList
              teams={teams}
              selectedTeam={selectedTeam}
              onSelectTeam={setSelectedTeam}
              loading={loading}
            />
          </div>

          <div className="md:col-span-3">
            <TeamDetailsDisplay selectedTeam={selectedTeam}>
              <TeamContent
                team={selectedTeam}
                teamMembers={teamMembers}
                isCurrentUserAdmin={isCurrentUserAdmin}
                onMemberUpdated={fetchTeamMembers}
                onDeleteTeam={handleDeleteTeam}
              />
            </TeamDetailsDisplay>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Teams;
