import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
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
import { Plus, Users, UserPlus, UserCheck, UserX, PenSquare, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TeamTasksList } from '@/components/tasks/TeamTasksList';
import { createTeam, getTeams, getTeamMembers, TeamMember } from '@/lib/api';

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
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { user } = useAuth();

  const teamForm = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchTeamsData = async () => {
      if (user) {
        const teamsData = await getTeams(user.id);
        setTeams(teamsData);
      }
    };

    fetchTeamsData();
  }, [user]);

  useEffect(() => {
    const fetchTeamMembersData = async () => {
      if (selectedTeam) {
        const members = await getTeamMembers(selectedTeam.id);
        setTeamMembers(members);
      }
    };

    fetchTeamMembersData();
  }, [selectedTeam]);

  const handleTeamCreate = async (values: TeamFormValues) => {
    if (!user) return;

    try {
      await createTeam({
        ...values,
        created_by: user.id,
      });

      const teamsData = await getTeams(user.id);
      setTeams(teamsData);
      toast.success("Team created successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsTeamDialogOpen(false);
    }
  };

  const renderMemberList = (members: TeamMember[]) => {
    return members.map((member) => (
      <div key={member.id} className="flex items-center justify-between p-3 border-b last:border-0">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={member.profile?.avatar_url || undefined} />
            <AvatarFallback>
              {`${member.profile?.first_name?.charAt(0) || ''}${member.profile?.last_name?.charAt(0) || ''}`}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{`${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`}</p>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <PenSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teams</h1>
          <Dialog>
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
                {teams.length > 0 ? (
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
              <Tabs defaultvalue="tasks" className="w-full">
                <TabsList>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks">
                  <TeamTasksList teamId={selectedTeam.id} />
                </TabsContent>
                <TabsContent value="members">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Manage team members and their roles</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {teamMembers.length > 0 ? (
                        renderMemberList(teamMembers)
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No members in this team yet. Invite someone to join!
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Invite Member</DialogTitle>
                            <DialogDescription>
                              Invite a new member to the team.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="email" className="text-right">
                                Email
                              </Label>
                              <Input id="email" value="shadcn@example.com" className="col-span-3" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Invite</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Settings</CardTitle>
                      <CardDescription>Manage team settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Settings content</p>
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
