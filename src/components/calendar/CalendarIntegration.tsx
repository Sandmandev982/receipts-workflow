
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarCheck, CalendarClock, ExternalLink, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface CalendarIntegrationProps {
  userId: string;
}

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

  const handleGCalConnect = async () => {
    setIsGCalLoading(true);
    
    // Simulate API call to connect to Google Calendar
    setTimeout(() => {
      setIsGCalConnected(true);
      setSyncEnabled(true);
      setIsGCalLoading(false);
      
      toast({
        title: "Calendar Connected",
        description: "Your Google Calendar has been successfully connected",
      });
    }, 1500);
  };

  const handleZoomConnect = async () => {
    if (!zoomEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your Zoom email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsZoomLoading(true);
    
    // Simulate API call to connect to Zoom
    setTimeout(() => {
      setIsZoomConnected(true);
      setZoomMeetingUrl(`https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`);
      setIsZoomLoading(false);
      
      toast({
        title: "Zoom Connected",
        description: "Your Zoom account has been successfully connected",
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
