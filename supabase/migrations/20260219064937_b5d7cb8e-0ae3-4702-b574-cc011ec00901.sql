
-- Function to get last active timestamp per user from user_activity
CREATE OR REPLACE FUNCTION public.admin_user_last_active()
RETURNS TABLE(user_id uuid, last_active timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT ua.user_id, max(ua.created_at) AS last_active
  FROM user_activity ua
  GROUP BY ua.user_id;
END;
$$;
