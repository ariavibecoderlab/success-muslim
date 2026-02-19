
-- 1. Admin audit log table
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage audit log"
  ON public.admin_audit_log FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. admin_overview_stats()
CREATE OR REPLACE FUNCTION public.admin_overview_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM profiles),
    'today_signups', (SELECT count(*) FROM profiles WHERE created_at::date = CURRENT_DATE),
    'dau', (SELECT count(DISTINCT user_id) FROM user_activity WHERE created_at::date = CURRENT_DATE),
    'mau', (SELECT count(DISTINCT user_id) FROM user_activity WHERE created_at > now() - interval '30 days'),
    'onboarding_completed', (SELECT count(*) FILTER (WHERE onboarding_completed = true) FROM profiles),
    'onboarding_total', (SELECT count(*) FROM profiles)
  ) INTO result;

  RETURN result;
END;
$$;

-- 3. admin_signup_chart(days)
CREATE OR REPLACE FUNCTION public.admin_signup_chart(_days int DEFAULT 30)
RETURNS TABLE(signup_date date, signup_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT d::date AS signup_date, COALESCE(count(p.id), 0) AS signup_count
  FROM generate_series(CURRENT_DATE - (_days - 1), CURRENT_DATE, '1 day') d
  LEFT JOIN profiles p ON p.created_at::date = d::date
  GROUP BY d::date
  ORDER BY d::date;
END;
$$;

-- 4. admin_module_usage()
CREATE OR REPLACE FUNCTION public.admin_module_usage()
RETURNS TABLE(module text, usage_count bigint, unique_users bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT ua.module, count(*) AS usage_count, count(DISTINCT ua.user_id) AS unique_users
  FROM user_activity ua
  GROUP BY ua.module
  ORDER BY usage_count DESC;
END;
$$;

-- 5. admin_user_breakdown()
CREATE OR REPLACE FUNCTION public.admin_user_breakdown()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  focus_data jsonb;
  consistency_data jsonb;
  country_data jsonb;
  city_data jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Focus areas breakdown
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO focus_data
  FROM (
    SELECT elem::text AS area, count(*) AS cnt
    FROM profiles, jsonb_array_elements(COALESCE(focus_areas, '[]'::jsonb)) elem
    GROUP BY elem::text
    ORDER BY cnt DESC
  ) t;

  -- Consistency level breakdown
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO consistency_data
  FROM (
    SELECT COALESCE(consistency_level, 'Not set') AS level, count(*) AS cnt
    FROM profiles
    GROUP BY consistency_level
    ORDER BY cnt DESC
  ) t;

  -- Top 10 countries
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO country_data
  FROM (
    SELECT COALESCE(country, 'Unknown') AS country, count(*) AS cnt
    FROM profiles
    GROUP BY country
    ORDER BY cnt DESC
    LIMIT 10
  ) t;

  -- Top 10 cities
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO city_data
  FROM (
    SELECT COALESCE(city, 'Unknown') AS city, count(*) AS cnt
    FROM profiles
    GROUP BY city
    ORDER BY cnt DESC
    LIMIT 10
  ) t;

  result := jsonb_build_object(
    'focus_areas', focus_data,
    'consistency_levels', consistency_data,
    'top_countries', country_data,
    'top_cities', city_data
  );

  RETURN result;
END;
$$;

-- 6. admin_retention_cohorts()
CREATE OR REPLACE FUNCTION public.admin_retention_cohorts()
RETURNS TABLE(cohort_week date, cohort_size bigint, d1 numeric, d3 numeric, d7 numeric, d14 numeric, d30 numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  WITH cohorts AS (
    SELECT
      p.id AS user_id,
      date_trunc('week', p.created_at)::date AS signup_week
    FROM profiles p
  ),
  activity AS (
    SELECT DISTINCT ua.user_id, ua.created_at::date AS activity_date
    FROM user_activity ua
  )
  SELECT
    c.signup_week AS cohort_week,
    count(DISTINCT c.user_id) AS cohort_size,
    ROUND(100.0 * count(DISTINCT CASE WHEN a.activity_date = c.signup_week + 1 THEN c.user_id END) / NULLIF(count(DISTINCT c.user_id), 0), 1) AS d1,
    ROUND(100.0 * count(DISTINCT CASE WHEN a.activity_date = c.signup_week + 3 THEN c.user_id END) / NULLIF(count(DISTINCT c.user_id), 0), 1) AS d3,
    ROUND(100.0 * count(DISTINCT CASE WHEN a.activity_date = c.signup_week + 7 THEN c.user_id END) / NULLIF(count(DISTINCT c.user_id), 0), 1) AS d7,
    ROUND(100.0 * count(DISTINCT CASE WHEN a.activity_date = c.signup_week + 14 THEN c.user_id END) / NULLIF(count(DISTINCT c.user_id), 0), 1) AS d14,
    ROUND(100.0 * count(DISTINCT CASE WHEN a.activity_date = c.signup_week + 30 THEN c.user_id END) / NULLIF(count(DISTINCT c.user_id), 0), 1) AS d30
  FROM cohorts c
  LEFT JOIN activity a ON a.user_id = c.user_id
  GROUP BY c.signup_week
  ORDER BY c.signup_week DESC
  LIMIT 12;
END;
$$;
