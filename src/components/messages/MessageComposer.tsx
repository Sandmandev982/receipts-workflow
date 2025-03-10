
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface MessageProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  team_id: string | null;
  created_at: string;
  read: boolean;
  profile?: MessageProfile;
}

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface MessageComposerProps {
  recipientId: string | null;
  teamId: string | null;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ recipientId, teamId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && (recipientId || teamId)) {
      fetchMessages();
      
      if (recipientId) {
        fetchRecipient(recipientId);
        markMessagesAsRead();
      }
      
      subscribeToMessages();
    }
  }, [user, recipientId, teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRecipient = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setRecipient(data);
      }
    } catch (error) {
      console.error('Error fetching recipient:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`);
      
      if (recipientId) {
        query = query.or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`);
      } else if (teamId) {
        query = query.eq('team_id', teamId);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Filter to show only messages between these two users or for this team
        let filteredMessages = data;
        
        if (recipientId) {
          filteredMessages = data.filter(msg => 
            (msg.sender_id === user?.id && msg.recipient_id === recipientId) || 
            (msg.sender_id === recipientId && msg.recipient_id === user?.id)
          );
        }
        
        // Now fetch profile information for each sender
        const senderIds = [...new Set(filteredMessages.map(msg => msg.sender_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', senderIds);
          
        if (profilesError) throw profilesError;
        
        // Attach profile information to each message
        const messagesWithProfiles = filteredMessages.map(msg => {
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
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !recipientId) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', recipientId)
        .eq('read', false);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Check if the message is relevant to this conversation
          if (recipientId) {
            if (
              (newMsg.sender_id === user?.id && newMsg.recipient_id === recipientId) ||
              (newMsg.sender_id === recipientId && newMsg.recipient_id === user?.id)
            ) {
              // Fetch profile information for the message
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
              
              // Mark as read if it's addressed to current user
              if (newMsg.recipient_id === user?.id) {
                markMessagesAsRead();
              }
            }
          } else if (teamId && newMsg.team_id === teamId) {
            // For team messages
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    if (!recipientId && !teamId) {
      toast.error('Please select a recipient or team to send a message');
      return;
    }
    
    try {
      setSending(true);
      
      const messageData = {
        sender_id: user.id,
        recipient_id: recipientId || null,
        team_id: teamId || null,
        content: newMessage.trim(),
        read: false
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(messageData);
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
      {recipientId && recipient && (
        <div className="border-b p-3 flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={recipient.avatar_url || undefined} />
            <AvatarFallback>
              {getInitials(recipient.first_name, recipient.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {`${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown User'}
            </h3>
          </div>
        </div>
      )}
      
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
            No messages yet. Send a message to start the conversation.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="border-t p-3 flex items-center gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
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

export default MessageComposer;
