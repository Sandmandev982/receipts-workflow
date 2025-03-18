
-- Create a helper function to check if a user has connected their calendar
CREATE OR REPLACE FUNCTION public.check_calendar_connection(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.calendar_integrations 
    WHERE user_id = user_id_param 
    AND provider = 'google'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
