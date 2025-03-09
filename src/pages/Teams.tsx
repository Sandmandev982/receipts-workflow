
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, UserPlus, Users, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Team {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  member_count?: number;
}

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'admin' | 'member';
  name: string;
  email?: string;
  avatar_url?: string;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      // Fetch teams the user is a member of
      const { data: membershipData, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      if (membershipError) throw membershipError;

      const teamIds = membershipData.map(item => item.team_id);

      // Fetch full team details
      if (teamIds.length > 0) {
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds);

        if (teamsError) throw teamsError;
        setMyTeams(teamsData || []);
      } else {
        setMyTeams([]);
      }

      // Fetch teams created by the user
      const { data: createdTeams, error: createdError } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', user?.id);

      if (createdError) throw createdError;

      // Combine and deduplicate teams
      const combinedTeams = [...(myTeams || []), ...(createdTeams || [])];
      const uniqueTeams = Array.from(new Map(combinedTeams.map(team => [team.id, team])).values());
      setTeams(uniqueTeams);
      
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error fetching teams",
        description: "Could not load your teams. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      toast({
        title: "Team name required",
        description: "Please enter a name for your team.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create new team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{ 
          name: newTeam.name, 
          description: newTeam.description,
          created_by: user?.id 
        }])
        .select();

      if (teamError) throw teamError;
      
      // Add current user as team admin
      if (teamData && teamData[0]) {
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{ 
            team_id: teamData[0].id, 
            user_id: user?.id,
            role: 'admin' 
          }]);

        if (memberError) throw memberError;
      }

      toast({
        title: "Team created",
        description: `Team "${newTeam.name}" has been created successfully.`
      });
      
      setNewTeam({ name: '', description: '' });
      setCreateDialogOpen(false);
      fetchTeams();
      
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error creating team",
        description: "Could not create your team. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedTeam) {
      toast({
        title: "Email required",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('email', inviteEmail)
        .single();

      // If user doesn't exist, create an invitation instead
      if (userError || !userData) {
        // For this demo, we'll just show a message - in a real app you'd store the invitation and send an email
        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${inviteEmail}.`
        });
        setInviteEmail('');
        setInviteDialogOpen(false);
        return;
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', selectedTeam.id)
        .eq('user_id', userData.id)
        .single();

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "This user is already a member of this team.",
          variant: "destructive"
        });
        return;
      }

      // Add user to team
      const { error: addMemberError } = await supabase
        .from('team_members')
        .insert([{ 
          team_id: selectedTeam.id, 
          user_id: userData.id,
          role: 'member' 
        }]);

      if (addMemberError) throw addMemberError;

      toast({
        title: "Member added",
        description: `${userData.first_name || 'User'} has been added to the team.`
      });
      
      setInviteEmail('');
      setInviteDialogOpen(false);
      fetchTeamMembers(selectedTeam.id);
      
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error inviting member",
        description: "Could not invite member. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          user_id,
          team_id,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      // Format member data
      const formattedMembers: TeamMember[] = membersData.map(member => ({
        id: member.id,
        user_id: member.user_id,
        team_id: member.team_id,
        role: member.role as 'admin' | 'member',
        name: `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim() || 'Unnamed User',
        avatar_url: member.profiles?.avatar_url
      }));

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error fetching members",
        description: "Could not load team members. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    fetchTeamMembers(team.id);
  };

  const handleOpenInviteDialog = (team: Team) => {
    setSelectedTeam(team);
    setInviteDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teams</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{team.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleViewTeam(team)}>
                    <Users className="mr-2 h-4 w-4" /> View
                  </Button>
                  <Button variant="secondary" onClick={() => handleOpenInviteDialog(team)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Invite
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/40">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Create a team to collaborate with others on tasks and projects
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Team
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Team Detail Dialog */}
        {selectedTeam && (
          <Dialog open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedTeam.name}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedTeam.description}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="members">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="tasks">Team Tasks</TabsTrigger>
                </TabsList>
                <TabsContent value="members" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Team Members</h3>
                    <Button size="sm" onClick={() => handleOpenInviteDialog(selectedTeam)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Invite
                    </Button>
                  </div>
                  
                  {teamMembers.length > 0 ? (
                    <div className="space-y-3">
                      {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-md border">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No team members yet</p>
                  )}
                </TabsContent>
                <TabsContent value="tasks" className="space-y-4 mt-4">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Team tasks will appear here</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
                      Go to Tasks
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}

        {/* Create Team Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Team</DialogTitle>
              <DialogDescription>
                Create a team to collaborate with others on tasks and projects.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter team name" 
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief description of the team's purpose" 
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Team</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Invite Member Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Invite someone to join your team. They'll get access to all team tasks.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="colleague@example.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Send Invitation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Teams;
