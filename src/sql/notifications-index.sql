
-- Add indices for better performance on notifications table
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);

-- Add function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = p_user_id AND read = false;
END;
$$ LANGUAGE plpgsql;
