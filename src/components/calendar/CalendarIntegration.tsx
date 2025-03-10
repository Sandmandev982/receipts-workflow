
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarCheck, CalendarClock, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarIntegrationProps {
  userId: string;
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsLoading(true);
    
    // Simulate API call to connect to Google Calendar
    setTimeout(() => {
      setIsConnected(true);
      setSyncEnabled(true);
      setIsLoading(false);
      
      toast({
        title: "Calendar Connected",
        description: "Your Google Calendar has been successfully connected",
        variant: "success",
      });
    }, 1500);
  };

  const handleToggleSync = (enabled: boolean) => {
    setSyncEnabled(enabled);
    
    toast({
      title: enabled ? "Sync Enabled" : "Sync Disabled",
      description: enabled 
        ? "Your tasks will now be synced to your Google Calendar" 
        : "Task syncing to Google Calendar has been disabled",
      variant: enabled ? "success" : "default",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSyncEnabled(false);
    
    toast({
      title: "Calendar Disconnected",
      description: "Your Google Calendar has been disconnected",
      variant: "default",
    });
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
        <CardDescription>
          Connect your tasks with Google Calendar to keep everything in sync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <Alert variant="success" className="bg-green-50 border-green-200">
              <CalendarCheck className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Your Google Calendar is connected
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-between space-x-2 pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="sync-toggle">Automatically sync tasks</Label>
                <p className="text-sm text-muted-foreground">
                  New tasks and updates will be sent to your calendar
                </p>
              </div>
              <Switch 
                id="sync-toggle" 
                checked={syncEnabled} 
                onCheckedChange={handleToggleSync} 
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <CalendarClock className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-medium">No Calendar Connected</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Google Calendar to sync your tasks
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isConnected ? (
          <>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              Open Calendar
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleConnect} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Connecting..." : "Connect Google Calendar"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CalendarIntegration;
