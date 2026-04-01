
-- 1. admin_engagement_stats
CREATE OR REPLACE FUNCTION public.admin_engagement_stats(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  dau_trend jsonb;
  adoption jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- DAU trend
  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.d), '[]'::jsonb) INTO dau_trend
  FROM (
    SELECT d::date AS d,
           count(DISTINCT ua.user_id) AS active_users
    FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day') d
    LEFT JOIN user_activity ua ON ua.created_at::date = d::date
    GROUP BY d::date
  ) t;

  -- Feature adoption: % of users who used each module at least once
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO adoption
  FROM (
    SELECT ua.module,
           count(DISTINCT ua.user_id) AS users,
           ROUND(100.0 * count(DISTINCT ua.user_id) / NULLIF((SELECT count(*) FROM profiles), 0), 1) AS adoption_pct
    FROM user_activity ua
    GROUP BY ua.module
    ORDER BY users DESC
  ) t;

  result := jsonb_build_object(
    'wau', (SELECT count(DISTINCT user_id) FROM user_activity WHERE created_at > now() - interval '7 days'),
    'dau_trend', dau_trend,
    'feature_adoption', adoption
  );

  RETURN result;
END;
$$;

-- 2. admin_iman_stats
CREATE OR REPLACE FUNCTION public.admin_iman_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  prayer_breakdown jsonb;
  most_missed jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Prayer status breakdown (this week)
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO prayer_breakdown
  FROM (
    SELECT status, count(*) AS cnt
    FROM salah_logs
    WHERE date >= date_trunc('week', CURRENT_DATE)::date
    GROUP BY status
  ) t;

  -- Most missed prayer
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO most_missed
  FROM (
    SELECT prayer_name, count(*) AS missed_count
    FROM salah_logs
    WHERE status = 'missed' AND date >= CURRENT_DATE - 30
    GROUP BY prayer_name
    ORDER BY missed_count DESC
  ) t;

  result := jsonb_build_object(
    'prayers_today', (SELECT count(*) FROM salah_logs WHERE date = CURRENT_DATE),
    'prayers_on_time_today', (SELECT count(*) FROM salah_logs WHERE date = CURRENT_DATE AND status = 'on_time'),
    'prayer_breakdown_week', prayer_breakdown,
    'most_missed_30d', most_missed,
    'quran_pages_this_week', (SELECT COALESCE(SUM(page_count), 0) FROM quran_reading_log WHERE date >= date_trunc('week', CURRENT_DATE)::date),
    'quran_readers_this_week', (SELECT count(DISTINCT user_id) FROM quran_reading_log WHERE date >= date_trunc('week', CURRENT_DATE)::date),
    'dhikr_total_today', (SELECT COALESCE(SUM(count), 0) FROM dhikr_sessions WHERE date = CURRENT_DATE),
    'dhikr_sessions_today', (SELECT count(*) FROM dhikr_sessions WHERE date = CURRENT_DATE),
    'fasters_today', (SELECT count(DISTINCT user_id) FROM fasting_log WHERE date = CURRENT_DATE),
    'sadaqah_this_month', (SELECT COALESCE(SUM(amount), 0) FROM sadaqah_donations WHERE date >= date_trunc('month', CURRENT_DATE)::date),
    'sadaqah_donors_this_month', (SELECT count(DISTINCT user_id) FROM sadaqah_donations WHERE date >= date_trunc('month', CURRENT_DATE)::date)
  );

  RETURN result;
END;
$$;

-- 3. admin_health_stats
CREATE OR REPLACE FUNCTION public.admin_health_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  bmi_dist jsonb;
  protocol_dist jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- BMI distribution buckets
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO bmi_dist
  FROM (
    SELECT
      CASE
        WHEN bmi < 18.5 THEN 'Underweight'
        WHEN bmi < 25 THEN 'Normal'
        WHEN bmi < 30 THEN 'Overweight'
        ELSE 'Obese'
      END AS category,
      count(*) AS cnt
    FROM health_bmi
    GROUP BY 1
    ORDER BY cnt DESC
  ) t;

  -- IF protocol distribution
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO protocol_dist
  FROM (
    SELECT COALESCE(recommended_protocol, 'Not set') AS protocol, count(*) AS cnt
    FROM user_health_profiles
    WHERE completed_at IS NOT NULL
    GROUP BY recommended_protocol
    ORDER BY cnt DESC
  ) t;

  result := jsonb_build_object(
    'health_profiles_count', (SELECT count(*) FROM user_health_profiles WHERE completed_at IS NOT NULL),
    'bmi_distribution', bmi_dist,
    'if_protocol_distribution', protocol_dist,
    'avg_sleep_duration', (SELECT ROUND(AVG(duration)::numeric, 1) FROM sleep_log WHERE date >= CURRENT_DATE - 30),
    'sleep_loggers_30d', (SELECT count(DISTINCT user_id) FROM sleep_log WHERE date >= CURRENT_DATE - 30),
    'weight_trackers', (SELECT count(DISTINCT user_id) FROM weight_log)
  );

  RETURN result;
END;
$$;

-- 4. admin_family_overview
CREATE OR REPLACE FUNCTION public.admin_family_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  largest jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO largest
  FROM (
    SELECT f.id, f.name, f.group_type, f.created_at,
           count(fm.id) AS member_count
    FROM families f
    LEFT JOIN family_members fm ON fm.family_id = f.id
    GROUP BY f.id, f.name, f.group_type, f.created_at
    ORDER BY member_count DESC
    LIMIT 20
  ) t;

  result := jsonb_build_object(
    'total_groups', (SELECT count(*) FROM families),
    'total_families', (SELECT count(*) FROM families WHERE group_type = 'family'),
    'total_classes', (SELECT count(*) FROM families WHERE group_type = 'class'),
    'total_members', (SELECT count(*) FROM family_members),
    'largest_groups', largest
  );

  RETURN result;
END;
$$;

-- 5. admin_checkin_stats
CREATE OR REPLACE FUNCTION public.admin_checkin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  streak_dist jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO streak_dist
  FROM (
    SELECT
      CASE
        WHEN streak_day <= 3 THEN '1-3'
        WHEN streak_day <= 7 THEN '4-7'
        WHEN streak_day <= 14 THEN '8-14'
        WHEN streak_day <= 30 THEN '15-30'
        ELSE '30+'
      END AS bucket,
      count(*) AS cnt
    FROM (
      SELECT user_id, MAX(streak_day) AS streak_day
      FROM daily_checkins
      GROUP BY user_id
    ) sub
    GROUP BY 1
    ORDER BY MIN(sub.streak_day)
  ) t;

  result := jsonb_build_object(
    'checkins_today', (SELECT count(*) FROM daily_checkins WHERE date = CURRENT_DATE),
    'avg_streak', (SELECT ROUND(AVG(max_streak)::numeric, 1) FROM (SELECT MAX(streak_day) AS max_streak FROM daily_checkins GROUP BY user_id) sub),
    'total_checkin_users', (SELECT count(DISTINCT user_id) FROM daily_checkins),
    'streak_distribution', streak_dist
  );

  RETURN result;
END;
$$;

-- 6. admin_widget_popularity
CREATE OR REPLACE FUNCTION public.admin_widget_popularity()
RETURNS TABLE(widget_id text, enabled_count bigint, total_users bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT wp.widget_id,
         count(*) FILTER (WHERE wp.enabled) AS enabled_count,
         count(*) AS total_users
  FROM widget_preferences wp
  GROUP BY wp.widget_id
  ORDER BY enabled_count DESC;
END;
$$;

-- 7. admin_table_sizes
CREATE OR REPLACE FUNCTION public.admin_table_sizes()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_object_agg(tablename, cnt) INTO result
  FROM (
    SELECT t.tablename,
           (xpath('/cnt/text()', xml_count))[1]::text::bigint AS cnt
    FROM (
      SELECT tablename,
             query_to_xml(format('SELECT count(*) AS cnt FROM public.%I', tablename), false, false, '') AS xml_count
      FROM pg_tables
      WHERE schemaname = 'public'
    ) t
  ) sub;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- 8. admin_live_feed
CREATE OR REPLACE FUNCTION public.admin_live_feed(_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, user_id uuid, display_name text, module text, action text, created_at timestamptz, metadata jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT ua.id, ua.user_id, COALESCE(p.display_name, 'Unknown') AS display_name,
         ua.module, ua.action, ua.created_at, ua.metadata
  FROM user_activity ua
  LEFT JOIN profiles p ON p.id = ua.user_id
  ORDER BY ua.created_at DESC
  LIMIT _limit;
END;
$$;
