
import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from './NotificationService';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string | null;
  team_id: string | null;
  created_at: string;
  read: boolean;
}

export interface MessageWithProfile extends Message {
  sender_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export class MessageService {
  static async sendDirectMessage(senderId: string, recipientId: string, content: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          team_id: null,
          content,
          read: false
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Get sender name for notification
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', senderId)
        .single();
        
      const senderName = senderProfile 
        ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() 
        : 'Someone';
      
      // Create a notification for the recipient
      await NotificationService.createNotification({
        userId: recipientId,
        title: 'New Message',
        message: `You have received a new direct message from ${senderName}`,
        type: 'message',
        actionUrl: '/messages'
      });
      
      return data;
    } catch (error) {
      console.error('Error sending direct message:', error);
      return null;
    }
  }

  static async sendTeamMessage(senderId: string, teamId: string, content: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: null,
          team_id: teamId,
          content,
          read: false
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Get sender name for notification
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', senderId)
        .single();
        
      const senderName = senderProfile 
        ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() 
        : 'Someone';
      
      // Get all team members except the sender to notify them
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);
        
      if (teamMembers) {
        // Get team name for the notification
        const { data: team } = await supabase
          .from('teams')
          .select('name')
          .eq('id', teamId)
          .single();
          
        const teamName = team?.name || 'Unknown Team';
        
        // Notify all team members except the sender
        for (const member of teamMembers) {
          if (member.user_id !== senderId) {
            await NotificationService.createNotification({
              userId: member.user_id,
              title: 'New Team Message',
              message: `New message from ${senderName} in team "${teamName}"`,
              teamId,
              type: 'message',
              actionUrl: `/messages?team=${teamId}`
            });
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error sending team message:', error);
      return null;
    }
  }

  static async fetchDirectMessages(userId1: string, userId2: string): Promise<MessageWithProfile[]> {
    try {
      // Get messages between these two users
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get profiles for sender IDs
      const senderIds = [...new Set(data.map(msg => msg.sender_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', senderIds);
        
      if (profilesError) throw profilesError;
      
      // Attach profile data to messages
      return data.map(message => {
        const senderProfile = profiles?.find(p => p.id === message.sender_id);
        return {
          ...message,
          sender_profile: senderProfile ? {
            first_name: senderProfile.first_name,
            last_name: senderProfile.last_name,
            avatar_url: senderProfile.avatar_url
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      return [];
    }
  }

  static async fetchTeamMessages(teamId: string): Promise<MessageWithProfile[]> {
    try {
      // Get all messages for this team
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get profiles for sender IDs
      const senderIds = [...new Set(data.map(msg => msg.sender_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', senderIds);
        
      if (profilesError) throw profilesError;
      
      // Attach profile data to messages
      return data.map(message => {
        const senderProfile = profiles?.find(p => p.id === message.sender_id);
        return {
          ...message,
          sender_profile: senderProfile ? {
            first_name: senderProfile.first_name,
            last_name: senderProfile.last_name,
            avatar_url: senderProfile.avatar_url
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching team messages:', error);
      return [];
    }
  }

  static async markDirectMessagesAsRead(userId: string, otherUserId: string): Promise<boolean> {
    try {
      // Mark all messages from the other user to this user as read
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', userId)
        .eq('sender_id', otherUserId)
        .eq('read', false);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  static async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      // Count unread direct messages
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('read', false);
        
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  static async getRecentConversations(userId: string): Promise<any[]> {
    try {
      // This is a more complex query to get the most recent conversations
      // We need to find all users this user has exchanged messages with,
      // and get the most recent message for each conversation
      
      // First get all direct messages involving this user
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .is('team_id', null)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (!allMessages || allMessages.length === 0) {
        return [];
      }
      
      // Find unique conversation partners
      const conversations = new Map();
      
      allMessages.forEach(message => {
        const partnerId = message.sender_id === userId ? message.recipient_id : message.sender_id;
        
        // Skip if no partner (should not happen for direct messages)
        if (!partnerId) return;
        
        // If we haven't seen this partner yet, add them
        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            partnerId,
            lastMessage: message,
            unreadCount: message.recipient_id === userId && !message.read ? 1 : 0
          });
        } 
        // If this is an unread message to the user, increment the count
        else if (message.recipient_id === userId && !message.read) {
          const convo = conversations.get(partnerId);
          convo.unreadCount++;
          conversations.set(partnerId, convo);
        }
      });
      
      // Convert to array
      const conversationList = Array.from(conversations.values());
      
      // Get profile info for all conversation partners
      const partnerIds = conversationList.map(c => c.partnerId);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', partnerIds);
        
      if (profilesError) throw profilesError;
      
      // Attach profile info to conversations
      return conversationList.map(convo => {
        const profile = profiles?.find(p => p.id === convo.partnerId);
        return {
          ...convo,
          profile: profile || null
        };
      });
    } catch (error) {
      console.error('Error getting recent conversations:', error);
      return [];
    }
  }
}
