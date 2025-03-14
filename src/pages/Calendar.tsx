
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import CalendarIntegration from '@/components/calendar/CalendarIntegration';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Video } from 'lucide-react';

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Show welcome toast when component mounts
    toast({
      title: "Calendar & Meeting Integrations",
      description: "Connect your tasks with calendar services and meeting platforms",
    });
  }, [toast]);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-1.5">
          <h1 className="text-2xl font-bold">Calendar & Meetings</h1>
          <p className="text-muted-foreground">
            Sync your tasks with external calendar services and connect to meeting platforms
          </p>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CalendarIntegration userId={user?.id || ''} />
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Customize how your tasks appear and behave with external services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">How the Calendar Integration Works</h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Tasks are synced based on their due dates</li>
                    <li>Task updates are reflected in your calendar</li>
                    <li>Calendar events do not sync back to Receipts</li>
                    <li>Task completions are marked on calendar events</li>
                  </ul>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">How the Zoom Integration Works</h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Link Zoom meetings directly to your tasks</li>
                    <li>Meeting URLs can be added to task descriptions</li>
                    <li>Join meetings directly from task cards</li>
                    <li>Automatically notify attendees about meetings</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://support.google.com/calendar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 hover:underline"
                    >
                      Google Calendar Help <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://support.zoom.us" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 hover:underline"
                    >
                      Zoom Support Center <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
