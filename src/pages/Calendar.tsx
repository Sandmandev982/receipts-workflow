
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import CalendarIntegration from '@/components/calendar/CalendarIntegration';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Show welcome toast when component mounts
    toast({
      title: "Calendar Integration",
      description: "Connect your tasks with your favorite calendar service",
    });
  }, [toast]);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-1.5">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            Sync your tasks with external calendar services
          </p>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CalendarIntegration userId={user?.id || ''} />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Calendar Settings</h2>
            <p className="text-sm text-muted-foreground">
              When you connect your calendar, tasks will automatically sync based on their due dates and times.
              You can customize how tasks appear in your calendar and when they should sync.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">How it works</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Tasks are synced based on their due dates</li>
                <li>Task updates are reflected in your calendar</li>
                <li>Calendar events do not sync back to Receipts</li>
                <li>Task completions are marked on calendar events</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
