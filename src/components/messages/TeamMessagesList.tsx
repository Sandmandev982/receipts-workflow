
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { getTeamMembers } from '@/lib/api';

interface MessageProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  team_id: string;
  created_at: string;
  profile?: MessageProfile;
}

interface TeamMessageListProps {
  teamId: string;
}

const TeamMessagesList: React.FC<TeamMessageListProps> = ({ teamId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamName, setTeamName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && teamId) {
      fetchTeamInfo();
      fetchMessages();
      subscribeToMessages();
    }
  }, [user, teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTeamInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setTeamName(data.name);
      }
    } catch (error) {
      console.error('Error fetching team info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Now fetch profile information for each sender
        const senderIds = [...new Set(data.map(msg => msg.sender_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', senderIds);
          
        if (profilesError) throw profilesError;
        
        // Attach profile information to each message
        const messagesWithProfiles = data.map(msg => {
          const senderProfile = profilesData?.find(profile => profile.id === msg.sender_id);
          return {
            ...msg,
            profile: senderProfile ? {
              first_name: senderProfile.first_name,
              last_name: senderProfile.last_name,
              avatar_url: senderProfile.avatar_url
            } : undefined
          };
        });
        
        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching team messages:', error);
      toast.error('Failed to load team messages');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('team-messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `team_id=eq.${teamId}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Fetch profile information for the message sender
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', newMsg.sender_id)
            .single();
            
          const messageWithProfile = {
            ...newMsg,
            profile: profileData ? {
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              avatar_url: profileData.avatar_url
            } : undefined
          };
          
          setMessages(prev => [...prev, messageWithProfile]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !teamId) return;
    
    try {
      setSending(true);
      
      const messageData = {
        sender_id: user.id,
        recipient_id: null,
        team_id: teamId,
        content: newMessage.trim()
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(messageData);
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending team message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null): string => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3">
        <h3 className="font-medium">{teamName || 'Team Chat'}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex max-w-[80%]">
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={message.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(message.profile?.first_name, message.profile?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div>
                    {!isCurrentUser && (
                      <div className="text-xs font-medium mb-1 px-1">
                        {`${message.profile?.first_name || ''} ${message.profile?.last_name || ''}`.trim() || 'Unknown User'}
                      </div>
                    )}
                    <div 
                      className={`rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                      {formatMessageTime(message.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground">
            No messages yet. Send a message to start the team conversation.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="border-t p-3 flex items-center gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message to the team..."
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default TeamMessagesList;
