
-- 1. admin_iman_trends: daily prayer/quran/dhikr over time
CREATE OR REPLACE FUNCTION public.admin_iman_trends(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  prayer_trend jsonb;
  quran_trend jsonb;
  dhikr_trend jsonb;
  fasting_trend jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.d), '[]'::jsonb) INTO prayer_trend
  FROM (
    SELECT d::date AS d,
           count(DISTINCT sl.id) FILTER (WHERE sl.status = 'on_time') AS on_time,
           count(DISTINCT sl.id) FILTER (WHERE sl.status = 'late') AS late,
           count(DISTINCT sl.id) FILTER (WHERE sl.status = 'missed') AS missed,
           count(DISTINCT sl.user_id) AS unique_users
    FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day') d
    LEFT JOIN salah_logs sl ON sl.date = d::date
    GROUP BY d::date
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.d), '[]'::jsonb) INTO quran_trend
  FROM (
    SELECT d::date AS d,
           COALESCE(SUM(qrl.page_count), 0) AS pages,
           count(DISTINCT qrl.user_id) AS readers
    FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day') d
    LEFT JOIN quran_reading_log qrl ON qrl.date = d::date
    GROUP BY d::date
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.d), '[]'::jsonb) INTO dhikr_trend
  FROM (
    SELECT d::date AS d,
           COALESCE(SUM(ds.count), 0) AS total_count,
           count(DISTINCT ds.user_id) AS users
    FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day') d
    LEFT JOIN dhikr_sessions ds ON ds.date = d::date
    GROUP BY d::date
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.d), '[]'::jsonb) INTO fasting_trend
  FROM (
    SELECT d::date AS d,
           count(DISTINCT fl.user_id) AS fasters
    FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day') d
    LEFT JOIN fasting_log fl ON fl.date = d::date
    GROUP BY d::date
  ) t;

  result := jsonb_build_object(
    'prayer_trend', prayer_trend,
    'quran_trend', quran_trend,
    'dhikr_trend', dhikr_trend,
    'fasting_trend', fasting_trend
  );

  RETURN result;
END;
$$;

-- 2. admin_health_trends: sleep and weight over time
CREATE OR REPLACE FUNCTION public.admin_health_trends(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  sleep_trend jsonb;
  weight_trend jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.d), '[]'::jsonb) INTO sleep_trend
  FROM (
    SELECT d::date AS d,
           ROUND(AVG(s.duration)::numeric, 1) AS avg_duration,
           count(DISTINCT s.user_id) AS loggers
    FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day') d
    LEFT JOIN sleep_log s ON s.date = d::date
    GROUP BY d::date
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.d), '[]'::jsonb) INTO weight_trend
  FROM (
    SELECT d::date AS d,
           ROUND(AVG(w.weight)::numeric, 1) AS avg_weight,
           count(DISTINCT w.user_id) AS loggers
    FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day') d
    LEFT JOIN weight_log w ON w.date = d::date
    GROUP BY d::date
  ) t;

  result := jsonb_build_object(
    'sleep_trend', sleep_trend,
    'weight_trend', weight_trend
  );

  RETURN result;
END;
$$;

-- 3. admin_family_members: get members of a specific family
CREATE OR REPLACE FUNCTION public.admin_family_members(_family_id uuid)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, role text, joined_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT fm.user_id, COALESCE(p.display_name, 'Unknown') AS display_name,
         p.avatar_url, fm.role, fm.joined_at
  FROM family_members fm
  LEFT JOIN profiles p ON p.id = fm.user_id
  WHERE fm.family_id = _family_id
  ORDER BY fm.joined_at;
END;
$$;

-- 4. admin_sadaqah_by_category
CREATE OR REPLACE FUNCTION public.admin_sadaqah_by_category()
RETURNS TABLE(category text, total_amount numeric, donor_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT sd.category, SUM(sd.amount) AS total_amount, count(DISTINCT sd.user_id) AS donor_count
  FROM sadaqah_donations sd
  WHERE sd.date >= date_trunc('month', CURRENT_DATE)::date
  GROUP BY sd.category
  ORDER BY total_amount DESC;
END;
$$;
