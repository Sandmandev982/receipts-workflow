
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarCheck, CalendarClock, ExternalLink, Video, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';

interface CalendarIntegrationProps {
  userId: string;
}

// Mock type for integration status
interface IntegrationStatus {
  googleCalendar: boolean;
  googleSyncEnabled: boolean;
  zoom: boolean;
  zoomEmail: string;
  zoomMeetingUrl: string;
}

// Mock API for now - in real implementation, would call Supabase edge functions
const connectGoogleCalendar = async (userId: string) => {
  // This would actually redirect to Google OAuth flow
  return new Promise<{success: boolean}>(resolve => {
    setTimeout(() => {
      // In real implementation, this would be a redirect to Google OAuth
      resolve({success: true});
    }, 1500);
  });
};

const connectZoom = async (userId: string, email: string) => {
  // This would actually connect to Zoom API via backend
  return new Promise<{success: boolean, meetingUrl: string}>(resolve => {
    setTimeout(() => {
      // In real implementation, this would connect to Zoom API
      resolve({
        success: true, 
        meetingUrl: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`
      });
    }, 1500);
  });
};

// Mock function for getting calendar integration status
const getIntegrationStatus = async (userId: string): Promise<IntegrationStatus> => {
  // In real implementation, this would check Supabase for stored connections
  return {
    googleCalendar: false,
    googleSyncEnabled: false,
    zoom: false,
    zoomEmail: '',
    zoomMeetingUrl: ''
  };
};

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ userId }) => {
  // Google Calendar states
  const [isGCalConnected, setIsGCalConnected] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isGCalLoading, setIsGCalLoading] = useState(false);
  
  // Zoom states
  const [isZoomConnected, setIsZoomConnected] = useState(false);
  const [isZoomLoading, setIsZoomLoading] = useState(false);
  const [zoomEmail, setZoomEmail] = useState('');
  const [zoomMeetingUrl, setZoomMeetingUrl] = useState('');
  
  const { toast } = useToast();
  
  // Load integration status
  const { data: integrationStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['integrationStatus', userId],
    queryFn: () => getIntegrationStatus(userId),
    enabled: !!userId
  });
  
  // Handle data once it's loaded
  useEffect(() => {
    if (integrationStatus) {
      setIsGCalConnected(integrationStatus.googleCalendar || false);
      setSyncEnabled(integrationStatus.googleSyncEnabled || false);
      setIsZoomConnected(integrationStatus.zoom || false);
      setZoomEmail(integrationStatus.zoomEmail || '');
      setZoomMeetingUrl(integrationStatus.zoomMeetingUrl || '');
    }
  }, [integrationStatus]);
  
  // Google Calendar connection mutation
  const gCalendarMutation = useMutation({
    mutationFn: (userId: string) => connectGoogleCalendar(userId),
    onMutate: () => {
      setIsGCalLoading(true);
    },
    onSuccess: () => {
      setIsGCalConnected(true);
      setSyncEnabled(true);
      
      toast({
        title: "Calendar Connected",
        description: "Your Google Calendar has been successfully connected",
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Calendar. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsGCalLoading(false);
    }
  });

  const handleGCalConnect = async () => {
    if (!userId) return;
    gCalendarMutation.mutate(userId);
  };

  // Zoom connection mutation
  const zoomMutation = useMutation({
    mutationFn: ({userId, email}: {userId: string, email: string}) => connectZoom(userId, email),
    onMutate: () => {
      setIsZoomLoading(true);
    },
    onSuccess: (data) => {
      setIsZoomConnected(true);
      setZoomMeetingUrl(data.meetingUrl);
      
      toast({
        title: "Zoom Connected",
        description: "Your Zoom account has been successfully connected",
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Zoom. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsZoomLoading(false);
    }
  });

  const handleZoomConnect = async () => {
    if (!userId || !zoomEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your Zoom email address",
        variant: "destructive"
      });
      return;
    }
    
    zoomMutation.mutate({userId, email: zoomEmail});
  };

  const handleToggleSync = (enabled: boolean) => {
    setSyncEnabled(enabled);
    
    toast({
      title: enabled ? "Sync Enabled" : "Sync Disabled",
      description: enabled 
        ? "Your tasks will now be synced to your Google Calendar" 
        : "Task syncing to Google Calendar has been disabled",
    });
  };

  const handleDisconnectGCal = () => {
    setIsGCalConnected(false);
    setSyncEnabled(false);
    
    toast({
      title: "Calendar Disconnected",
      description: "Your Google Calendar has been disconnected",
    });
  };
  
  const handleDisconnectZoom = () => {
    setIsZoomConnected(false);
    setZoomMeetingUrl('');
    
    toast({
      title: "Zoom Disconnected",
      description: "Your Zoom account has been disconnected",
    });
  };

  if (isStatusLoading) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Integrations
          </CardTitle>
          <CardDescription>
            Loading your integration status...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Integrations
        </CardTitle>
        <CardDescription>
          Connect your tasks with calendar services and video conferencing tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google">Google Calendar</TabsTrigger>
            <TabsTrigger value="zoom">Zoom Meetings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="google" className="space-y-4 pt-4">
            {isGCalConnected ? (
              <>
                <Alert className="bg-green-50 border-green-200">
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
                
                <div className="rounded-md border p-3 bg-muted/40">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Demo Mode</p>
                      <p className="text-xs text-muted-foreground">
                        In a real implementation, this would connect to the actual Google Calendar API through OAuth. For this demo, we're simulating the connection.
                      </p>
                    </div>
                  </div>
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
            
            {isGCalConnected ? (
              <div className="flex justify-between pt-4">
                <Button variant="outline" size="sm" onClick={handleDisconnectGCal}>
                  Disconnect
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Open Calendar
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleGCalConnect} 
                disabled={isGCalLoading}
                className="w-full"
              >
                {isGCalLoading ? "Connecting..." : "Connect Google Calendar"}
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="zoom" className="space-y-4 pt-4">
            {isZoomConnected ? (
              <>
                <Alert className="bg-blue-50 border-blue-200">
                  <Video className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    Your Zoom account is connected
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label>Your Personal Meeting URL</Label>
                  <div className="flex">
                    <Input 
                      value={zoomMeetingUrl} 
                      readOnly 
                      className="flex-1 rounded-r-none"
                    />
                    <Button
                      variant="outline"
                      className="rounded-l-none"
                      onClick={() => {
                        navigator.clipboard.writeText(zoomMeetingUrl);
                        toast({
                          title: "Copied to clipboard",
                          description: "Meeting URL has been copied to clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this URL to create meetings directly from your tasks
                  </p>
                </div>
                
                <div className="rounded-md border p-3 bg-muted/40">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Demo Mode</p>
                      <p className="text-xs text-muted-foreground">
                        In a real implementation, this would connect to the actual Zoom API. For this demo, we're simulating the connection.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <Video className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-medium">No Zoom Account Connected</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Zoom account to create meetings for your tasks
                  </p>
                </div>
              </div>
            )}
            
            {isZoomConnected ? (
              <div className="flex justify-between pt-4">
                <Button variant="outline" size="sm" onClick={handleDisconnectZoom}>
                  Disconnect
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => window.open(zoomMeetingUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Zoom
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zoom-email">Zoom Email Address</Label>
                  <Input
                    id="zoom-email"
                    type="email"
                    placeholder="your-email@example.com"
                    value={zoomEmail}
                    onChange={(e) => setZoomEmail(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleZoomConnect} 
                  disabled={isZoomLoading}
                  className="w-full"
                >
                  {isZoomLoading ? "Connecting..." : "Connect Zoom Account"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CalendarIntegration;
