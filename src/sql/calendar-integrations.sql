
-- Create table for calendar integrations
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable Row Level Security
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own integrations
CREATE POLICY "Users can view their own calendar integrations"
ON public.calendar_integrations
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own integrations
CREATE POLICY "Users can create their own calendar integrations"
ON public.calendar_integrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own integrations
CREATE POLICY "Users can update their own calendar integrations"
ON public.calendar_integrations
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy for users to delete their own integrations
CREATE POLICY "Users can delete their own calendar integrations"
ON public.calendar_integrations
FOR DELETE
USING (auth.uid() = user_id);

-- Add calendar_event_id column to tasks if it doesn't exist
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_calendar_event_id ON public.tasks(calendar_event_id);
