
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessagesList from '@/components/messages/MessagesList';
import MessageComposer from '@/components/messages/MessageComposer';
import TeamMessagesList from '@/components/messages/TeamMessagesList';
import { getTeams } from '@/lib/api';

const Messages = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; }>>([]);
  const [activeTab, setActiveTab] = useState("direct");

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  const loadTeams = async () => {
    if (!user) return;
    
    try {
      const userTeams = await getTeams(user.id);
      setTeams(userTeams);
      
      // If we have teams and no team is selected, select the first one
      if (userTeams.length > 0 && !selectedTeamId) {
        setSelectedTeamId(userTeams[0].id);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    // Reset team selection when selecting a user
    setSelectedTeamId(null);
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    // Reset user selection when selecting a team
    setSelectedUserId(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        <Tabs defaultValue="direct" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="direct">Direct Messages</TabsTrigger>
            <TabsTrigger value="team">Team Messages</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 border rounded-lg overflow-hidden">
              <TabsContent value="direct" className="m-0">
                <MessagesList onSelectUser={handleUserSelect} selectedUserId={selectedUserId} />
              </TabsContent>
              
              <TabsContent value="team" className="m-0">
                {teams.length > 0 ? (
                  <div className="p-3 space-y-2">
                    {teams.map(team => (
                      <button
                        key={team.id}
                        onClick={() => handleTeamSelect(team.id)}
                        className={`w-full text-left p-2 rounded ${
                          selectedTeamId === team.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                        }`}
                      >
                        {team.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    You're not part of any teams yet.
                  </div>
                )}
              </TabsContent>
            </div>
            
            <div className="md:col-span-3 border rounded-lg overflow-hidden flex flex-col h-[600px]">
              {activeTab === "direct" && selectedUserId ? (
                <MessageComposer 
                  recipientId={selectedUserId} 
                  teamId={null} 
                />
              ) : activeTab === "team" && selectedTeamId ? (
                <TeamMessagesList 
                  teamId={selectedTeamId} 
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
                  {activeTab === "direct" 
                    ? "Select a user to start messaging" 
                    : "Select a team to view team messages"}
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Messages;
