
CREATE OR REPLACE FUNCTION public.admin_user_detail_stats(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  family_list jsonb;
  week_start date;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  week_start := date_trunc('week', CURRENT_DATE)::date;

  -- Family memberships
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO family_list
  FROM (
    SELECT f.name, f.group_type, fm.role, fm.joined_at
    FROM family_members fm
    JOIN families f ON f.id = fm.family_id
    WHERE fm.user_id = _user_id
    ORDER BY fm.joined_at DESC
  ) t;

  result := jsonb_build_object(
    'prayers_7d_total', (SELECT count(*) FROM salah_logs WHERE user_id = _user_id AND date >= CURRENT_DATE - 7),
    'prayers_7d_on_time', (SELECT count(*) FROM salah_logs WHERE user_id = _user_id AND date >= CURRENT_DATE - 7 AND status = 'on_time'),
    'quran_pages_week', (SELECT COALESCE(SUM(page_count), 0) FROM quran_reading_log WHERE user_id = _user_id AND date >= week_start),
    'checkin_streak', (
      SELECT COALESCE(MAX(streak_day), 0)
      FROM daily_checkins
      WHERE user_id = _user_id
        AND date >= CURRENT_DATE - 60
    ),
    'fasting_days_month', (SELECT count(*) FROM fasting_log WHERE user_id = _user_id AND date >= date_trunc('month', CURRENT_DATE)::date),
    'dhikr_today', (SELECT COALESCE(SUM(count), 0) FROM dhikr_sessions WHERE user_id = _user_id AND date = CURRENT_DATE),
    'tasks_completed_week', (SELECT count(*) FROM daily_tasks WHERE user_id = _user_id AND date >= week_start AND completed = true),
    'tasks_total_week', (SELECT count(*) FROM daily_tasks WHERE user_id = _user_id AND date >= week_start),
    'families', family_list
  );

  RETURN result;
END;
$$;
