
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCalendarIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [syncingTasks, setSyncingTasks] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if the user has connected Google Calendar
  const checkConnection = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .single();

      if (error) {
        console.error('Error checking calendar connection:', error);
        return false;
      }

      const isConnected = !!data;
      setConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Connect to Google Calendar
  const connect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your calendar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-integration/auth-url');
      
      if (error) throw error;
      if (!data || !data.url) throw new Error("Failed to generate authorization URL");
      
      // Redirect to Google OAuth consent screen
      window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Calendar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync tasks with Google Calendar
  const syncTasks = async (taskIds: string[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to sync tasks.",
        variant: "destructive"
      });
      return { success: false };
    }

    if (!connected && !(await checkConnection())) {
      toast({
        title: "Calendar Not Connected",
        description: "Please connect your Google Calendar before syncing tasks.",
        variant: "destructive"
      });
      return { success: false };
    }

    setSyncingTasks(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-integration/sync-tasks', {
        body: { taskIds },
      });
      
      if (error) throw error;
      
      toast({
        title: "Tasks Synced",
        description: `Successfully synced ${data.results.filter(r => r.success).length} tasks with Google Calendar.`,
      });
      
      return { 
        success: true, 
        results: data.results 
      };
    } catch (error) {
      console.error('Error syncing tasks:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync tasks with Google Calendar. Please try again.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setSyncingTasks(false);
    }
  };

  // Disconnect Google Calendar
  const disconnect = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('calendar-integration/disconnect', {
        method: 'POST',
      });
      
      if (error) throw error;
      
      setConnected(false);
      toast({
        title: "Calendar Disconnected",
        description: "Your Google Calendar has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect from Google Calendar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    connected,
    syncingTasks,
    checkConnection,
    connect,
    syncTasks,
    disconnect
  };
};
