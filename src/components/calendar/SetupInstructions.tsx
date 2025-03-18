
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Steps, StepItem } from '@/components/ui/steps';
import { ExternalLink } from 'lucide-react';

const GoogleCalendarSetupInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Google Calendar Integration</CardTitle>
        <CardDescription>
          Follow these steps to set up Google Calendar integration for your Receipts app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            You'll need to set up a Google Cloud project to enable the Calendar API and create credentials.
          </AlertDescription>
        </Alert>
        
        <Steps>
          <StepItem title="Create a Google Cloud project">
            <p className="text-sm text-muted-foreground mb-2">
              Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Google Cloud Console <ExternalLink className="inline h-3 w-3" />
              </a> and create a new project.
            </p>
          </StepItem>
          
          <StepItem title="Enable the Google Calendar API">
            <p className="text-sm text-muted-foreground mb-2">
              In your project, go to "APIs & Services" > "Library" and search for "Google Calendar API". 
              Click on it and press "Enable".
            </p>
          </StepItem>
          
          <StepItem title="Configure OAuth consent screen">
            <p className="text-sm text-muted-foreground mb-2">
              Go to "APIs & Services" > "OAuth consent screen". Choose "External" and fill in the required information:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>App name: "Receipts"</li>
                <li>User support email: Your email</li>
                <li>Developer contact information: Your email</li>
              </ul>
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Add the following scopes:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>./auth/calendar</li>
                <li>./auth/calendar.events</li>
              </ul>
            </p>
            <p className="text-sm text-muted-foreground">
              Add any test users for development.
            </p>
          </StepItem>
          
          <StepItem title="Create OAuth credentials">
            <p className="text-sm text-muted-foreground mb-2">
              Go to "APIs & Services" > "Credentials" and click "Create Credentials" > "OAuth client ID".
              Choose "Web application" as the application type.
              Add these authorized redirect URIs:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>http://localhost:5173/calendar?connection=success</li>
                <li>https://[your-production-domain.com]/calendar?connection=success</li>
              </ul>
            </p>
          </StepItem>
          
          <StepItem title="Add credentials to Supabase">
            <p className="text-sm text-muted-foreground">
              Add your Client ID and Client Secret to the Supabase Edge Function secrets:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>GOOGLE_CLIENT_ID: Your OAuth client ID</li>
                <li>GOOGLE_CLIENT_SECRET: Your OAuth client secret</li>
                <li>GOOGLE_REDIRECT_URI: http://localhost:5173/calendar?connection=success (or your production URL)</li>
              </ul>
            </p>
          </StepItem>
        </Steps>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarSetupInstructions;
