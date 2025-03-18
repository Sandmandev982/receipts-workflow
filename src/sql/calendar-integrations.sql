
-- Create a table to store calendar integration records
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Add task column for storing calendar event IDs
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_provider 
ON public.calendar_integrations(user_id, provider);

-- Add RLS policies
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own integrations
CREATE POLICY "Users can manage their own calendar integrations" 
ON public.calendar_integrations 
FOR ALL 
USING (auth.uid() = user_id);
