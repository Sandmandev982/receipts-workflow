
import React from 'react';
import { Steps, StepItem } from '@/components/ui/steps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const CONSOLE_URL = 'https://console.cloud.google.com/apis/credentials';

const SetupInstructions = () => {
  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Google Calendar Integration Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <Steps>
          <StepItem title="Create a Google Cloud Project">
            <p>
              To integrate with Google Calendar, you'll need to create a project in the Google Cloud Console
              and set up OAuth credentials.
            </p>
            <a
              href={CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center mt-2 hover:underline"
            >
              Go to Google Cloud Console
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </StepItem>
          
          <StepItem title="Configure OAuth Consent Screen">
            <p>
              Set up the OAuth consent screen with the following scopes:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>{'https://www.googleapis.com/auth/calendar'}</li>
              <li>{'https://www.googleapis.com/auth/calendar.events'}</li>
            </ul>
          </StepItem>
          
          <StepItem title="Create OAuth 2.0 Credentials">
            <p>
              Create OAuth 2.0 credentials and add the following redirect URI:
            </p>
            <code className="px-2 py-1 bg-muted rounded text-sm mt-2 block">
              {window.location.origin + '/calendar/oauth-callback'}
            </code>
          </StepItem>
          
          <StepItem title="Configure Application">
            <p>
              After creating your credentials, copy the Client ID and Client Secret to enable the integration.
            </p>
            <Link 
              to="/settings/integrations" 
              className="text-primary inline-flex items-center mt-2 hover:underline"
            >
              Go to Integration Settings
            </Link>
          </StepItem>
        </Steps>
      </CardContent>
    </Card>
  );
};

export default SetupInstructions;
