
import React, { useEffect, useState } from 'react';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarX, CheckCircle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCalendarSync: React.FC = () => {
  const { 
    loading, 
    connected, 
    syncingTasks,
    checkConnection, 
    connect, 
    syncTasks, 
    disconnect 
  } = useCalendarIntegration();
  const { tasks } = useTasks();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  // Check if we're returning from OAuth callback
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const connectionStatus = query.get('connection');
    
    if (connectionStatus === 'success') {
      setConnectionSuccess(true);
      toast({
        title: "Calendar Connected",
        description: "Your Google Calendar has been successfully connected.",
      });
      
      // Remove the query parameter
      navigate('/calendar', { replace: true });
      
      // Check connection status
      checkConnection();
    }
  }, [location.search]);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Get tasks that have due dates but no calendar event ID
  const syncableTasks = tasks.filter(task => 
    task.dueDate && 
    !task.calendar_event_id && 
    task.status !== 'complete'
  );

  const handleSyncAllTasks = async () => {
    if (syncableTasks.length === 0) {
      toast({
        title: "No Tasks to Sync",
        description: "There are no unsynchronized tasks with due dates.",
      });
      return;
    }
    
    await syncTasks(syncableTasks.map(task => task.id));
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync your tasks with Google Calendar to keep track of your deadlines.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : connected ? (
          <div className="space-y-4">
            <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle className="mr-2 h-5 w-5" />
              Connected to Google Calendar
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Tasks Available to Sync</h3>
              {syncableTasks.length > 0 ? (
                <div className="pl-4 border-l-2 border-muted space-y-1">
                  {syncableTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="text-sm">
                      • {task.title} 
                      {task.dueDate && <span className="text-muted-foreground text-xs ml-2">
                        (Due: {new Date(task.dueDate).toLocaleDateString()})
                      </span>}
                    </div>
                  ))}
                  {syncableTasks.length > 5 && (
                    <div className="text-sm text-muted-foreground">
                      ...and {syncableTasks.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tasks with due dates available to sync.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <Calendar className="h-16 w-16 text-primary/40" />
            <div className="text-center">
              <h3 className="font-medium mb-1">Not Connected</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Google Calendar to sync tasks and see them in your calendar.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {connected ? (
          <>
            <Button 
              variant="outline" 
              onClick={disconnect}
              disabled={loading}
            >
              <CalendarX className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
            
            <Button
              onClick={handleSyncAllTasks}
              disabled={syncingTasks || syncableTasks.length === 0}
            >
              {syncingTasks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Sync All Tasks
                </>
              )}
            </Button>
          </>
        ) : (
          <Button 
            className="w-full" 
            onClick={connect}
            disabled={loading}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Connect Google Calendar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GoogleCalendarSync;
