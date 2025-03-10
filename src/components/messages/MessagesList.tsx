
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  last_message?: string;
  unread_count?: number;
}

interface MessagesListProps {
  onSelectUser: (userId: string) => void;
  selectedUserId: string | null;
}

const MessagesList: React.FC<MessagesListProps> = ({ onSelectUser, selectedUserId }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsers();
      subscribeToMessages();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(u => 
        `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users except the current user
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .neq('id', user?.id || '');
      
      if (profilesError) throw profilesError;
      
      // Get last messages and unread count
      let userProfiles: User[] = [];
      
      if (profilesData) {
        for (const profile of profilesData) {
          // Get last message between current user and this user
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content, created_at')
            .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
            .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
            .order('created_at', { ascending: false })
            .limit(1);
          
          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: false })
            .eq('recipient_id', user?.id)
            .eq('sender_id', profile.id)
            .eq('read', false);
          
          userProfiles.push({
            ...profile,
            last_message: lastMessageData && lastMessageData.length > 0 ? lastMessageData[0].content : undefined,
            unread_count: unreadCount || 0
          });
        }
        
        // Sort by those with unread messages first, then by those with any messages
        userProfiles.sort((a, b) => {
          if ((a.unread_count || 0) > 0 && (b.unread_count || 0) === 0) return -1;
          if ((a.unread_count || 0) === 0 && (b.unread_count || 0) > 0) return 1;
          if (a.last_message && !b.last_message) return -1;
          if (!a.last_message && b.last_message) return 1;
          return 0;
        });
        
        setUsers(userProfiles);
        setFilteredUsers(userProfiles);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('Message change detected:', payload);
          // Refresh user list when messages change
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getInitials = (user: User): string => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y">
            {filteredUsers.map(u => (
              <button
                key={u.id}
                className={`w-full text-left p-3 hover:bg-secondary flex items-center ${
                  selectedUserId === u.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => onSelectUser(u.id)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(u)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">
                      {`${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User'}
                    </p>
                    {u.unread_count ? (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                        {u.unread_count}
                      </span>
                    ) : null}
                  </div>
                  {u.last_message && (
                    <p className="text-sm text-muted-foreground truncate">{u.last_message}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? 'No users match your search' : 'No users found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesList;
