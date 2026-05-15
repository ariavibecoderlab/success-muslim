
-- Drop old function first (return type mismatch requires DROP)
DROP FUNCTION IF EXISTS public.get_family_leaderboard(uuid);

-- Recreate with corrected JOIN (no fps.family_id)
CREATE OR REPLACE FUNCTION public.get_family_leaderboard(p_family_id uuid)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text,
  prayers_this_week bigint,
  quran_days_this_week bigint,
  fasting_days_this_week bigint,
  quran_streak bigint,
  iman_score integer,
  show_on_leaderboard boolean,
  ghost_mode boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  week_start date;
BEGIN
  IF NOT public.is_family_member(p_family_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  week_start := date_trunc('week', CURRENT_DATE)::date;

  RETURN QUERY
  SELECT
    fm.user_id,
    p.display_name,
    p.avatar_url,
    COALESCE((
      SELECT COUNT(DISTINCT sl.date || sl.prayer_name)
      FROM salah_logs sl
      WHERE sl.user_id = fm.user_id
        AND sl.date >= week_start
        AND sl.status != 'missed'
    ), 0)::bigint AS prayers_this_week,
    COALESCE((
      SELECT COUNT(*)
      FROM quran_daily_log qdl
      WHERE qdl.user_id = fm.user_id
        AND qdl.date >= week_start
        AND qdl.target_met = true
    ), 0)::bigint AS quran_days_this_week,
    COALESCE((
      SELECT COUNT(*)
      FROM fasting_log fl
      WHERE fl.user_id = fm.user_id
        AND fl.date >= week_start
    ), 0)::bigint AS fasting_days_this_week,
    COALESCE((
      WITH ranked AS (
        SELECT qdl2.date,
               ROW_NUMBER() OVER (ORDER BY qdl2.date DESC) AS rn
        FROM quran_daily_log qdl2
        WHERE qdl2.user_id = fm.user_id
          AND qdl2.target_met = true
          AND qdl2.date <= CURRENT_DATE
      ),
      streaks AS (
        SELECT r.date, (r.date - (r.rn || ' days')::interval)::date AS grp
        FROM ranked r
      )
      SELECT COUNT(*) FROM streaks
      WHERE grp = (SELECT grp FROM streaks ORDER BY date DESC LIMIT 1)
    ), 0)::bigint AS quran_streak,
    LEAST(100, (
      LEAST(50, COALESCE((
        SELECT COUNT(DISTINCT sl2.date || sl2.prayer_name)::integer
        FROM salah_logs sl2
        WHERE sl2.user_id = fm.user_id
          AND sl2.date >= week_start
          AND sl2.status != 'missed'
      ), 0) * 10) +
      LEAST(30, COALESCE((
        SELECT COUNT(*)::integer
        FROM quran_daily_log qdl3
        WHERE qdl3.user_id = fm.user_id
          AND qdl3.date >= week_start
          AND qdl3.target_met = true
      ), 0) * 5) +
      LEAST(20, COALESCE((
        SELECT COUNT(*)::integer
        FROM fasting_log fl2
        WHERE fl2.user_id = fm.user_id
          AND fl2.date >= week_start
      ), 0) * 3)
    ))::integer AS iman_score,
    COALESCE(fps.show_on_leaderboard, true) AS show_on_leaderboard,
    COALESCE(fps.ghost_mode, false) AS ghost_mode
  FROM family_members fm
  LEFT JOIN profiles p ON p.id = fm.user_id
  LEFT JOIN family_privacy_settings fps ON fps.user_id = fm.user_id
  WHERE fm.family_id = p_family_id
    AND fm.is_visible = true
  ORDER BY iman_score DESC;
END;
$$;
