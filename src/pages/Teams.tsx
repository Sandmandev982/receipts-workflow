
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import TeamTasksList from '@/components/tasks/TeamTasksList';
import TeamMembersList from '@/components/teams/TeamMembersList';
import TeamInviteForm from '@/components/teams/TeamInviteForm';
import { TeamService } from '@/services/TeamService';

const teamFormSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const { user } = useAuth();

  const teamForm = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

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
        teamForm.reset();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsTeamDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teams</h1>
          <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Team</DialogTitle>
                <DialogDescription>
                  Create a new team to collaborate with others.
                </DialogDescription>
              </DialogHeader>
              <Form {...teamForm}>
                <form onSubmit={teamForm.handleSubmit(handleTeamCreate)} className="space-y-4">
                  <FormField
                    control={teamForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Team Name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be displayed to other users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={teamForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Team Description" {...field} />
                        </FormControl>
                        <FormDescription>
                          Describe what this team is for.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="md:col-span-1">
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
                        onClick={() => setSelectedTeam(team)}
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
          </div>

          <div className="md:col-span-3">
            {selectedTeam ? (
              <Tabs defaultValue="tasks">
                <TabsList>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks">
                  <TeamTasksList teamId={selectedTeam.id} />
                </TabsContent>
                <TabsContent value="members">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Team Members</CardTitle>
                          <CardDescription>Manage team members and their roles</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <TeamMembersList 
                            teamId={selectedTeam.id}
                            members={teamMembers}
                            isCurrentUserAdmin={isCurrentUserAdmin}
                            onMemberUpdated={fetchTeamMembers}
                          />
                        </CardContent>
                      </Card>
                    </div>
                    
                    {isCurrentUserAdmin && (
                      <div className="md:col-span-1">
                        <TeamInviteForm 
                          teamId={selectedTeam.id}
                          teamName={selectedTeam.name}
                          onInviteSuccess={fetchTeamMembers}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Settings</CardTitle>
                      <CardDescription>Manage team settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isCurrentUserAdmin ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium">Team Name</h3>
                            <p className="text-sm text-muted-foreground">{selectedTeam.name}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium">Description</h3>
                            <p className="text-sm text-muted-foreground">{selectedTeam.description || 'No description provided'}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium">Created</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedTeam.created_at).toLocaleDateString()} at {' '}
                              {new Date(selectedTeam.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="pt-4">
                            <Button variant="destructive">Delete Team</Button>
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
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="inline-block w-12 h-12 mb-4 text-muted-foreground" />
                  <CardTitle>Select a Team</CardTitle>
                  <CardDescription>Choose a team from the list to view its details and manage tasks.</CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Teams;
