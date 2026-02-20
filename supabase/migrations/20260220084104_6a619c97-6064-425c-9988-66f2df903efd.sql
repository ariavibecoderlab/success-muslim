CREATE OR REPLACE FUNCTION public.get_family_leaderboard(p_family_id uuid)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, prayers_this_week bigint, quran_days_this_week bigint, fasting_days_this_week bigint, quran_streak bigint, iman_score integer, show_on_leaderboard boolean, ghost_mode boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  week_start date;
BEGIN
  -- Only family members can call this
  IF NOT public.is_family_member(p_family_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  week_start := date_trunc('week', CURRENT_DATE)::date;

  RETURN QUERY
  SELECT
    fm.user_id,
    p.display_name,
    p.avatar_url,
    -- Prayers this week (distinct prayer names logged with status not 'missed')
    COALESCE((
      SELECT COUNT(DISTINCT sl.date || sl.prayer_name)
      FROM salah_logs sl
      WHERE sl.user_id = fm.user_id
        AND sl.date >= week_start
        AND sl.status != 'missed'
    ), 0) AS prayers_this_week,
    -- Quran days this week
    COALESCE((
      SELECT COUNT(*)
      FROM quran_daily_log qdl
      WHERE qdl.user_id = fm.user_id
        AND qdl.date >= week_start
        AND qdl.target_met = true
    ), 0) AS quran_days_this_week,
    -- Fasting days this week
    COALESCE((
      SELECT COUNT(*)
      FROM fasting_log fl
      WHERE fl.user_id = fm.user_id
        AND fl.date >= week_start
    ), 0) AS fasting_days_this_week,
    -- Quran streak (consecutive target_met days up to today) — fully qualified
    COALESCE((
      WITH ranked AS (
        SELECT quran_daily_log.date,
               ROW_NUMBER() OVER (ORDER BY quran_daily_log.date DESC) AS rn
        FROM quran_daily_log
        WHERE quran_daily_log.user_id = fm.user_id
          AND quran_daily_log.target_met = true
          AND quran_daily_log.date <= CURRENT_DATE
      ),
      streaks AS (
        SELECT ranked.date, ranked.rn,
               (ranked.date - (ranked.rn || ' days')::interval)::date AS grp
        FROM ranked
      )
      SELECT COUNT(*) FROM streaks
      WHERE grp = (SELECT grp FROM streaks ORDER BY date DESC LIMIT 1)
    ), 0) AS quran_streak,
    -- Iman score: prayers 50pts max + quran 30pts max + fasting 20pts max, normalised to 100
    LEAST(100, (
      LEAST(50, COALESCE((
        SELECT COUNT(DISTINCT sl.date || sl.prayer_name)::integer * 10
        / NULLIF((CURRENT_DATE - week_start + 1) * 5, 0)
        * 50 / 100
        FROM salah_logs sl
        WHERE sl.user_id = fm.user_id
          AND sl.date >= week_start
          AND sl.status != 'missed'
      ), 0)) +
      LEAST(30, COALESCE((
        SELECT COUNT(*)::integer
        FROM quran_daily_log qdl
        WHERE qdl.user_id = fm.user_id
          AND qdl.date >= week_start
          AND qdl.target_met = true
      ), 0) * 30 / 7) +
      LEAST(20, COALESCE((
        SELECT COUNT(*)::integer
        FROM fasting_log fl
        WHERE fl.user_id = fm.user_id
          AND fl.date >= week_start
      ), 0) * 20 / 7)
    ))::integer AS iman_score,
    COALESCE(fps.show_on_leaderboard, true) AS show_on_leaderboard,
    COALESCE(fps.ghost_mode, false) AS ghost_mode
  FROM family_members fm
  LEFT JOIN profiles p ON p.id = fm.user_id
  LEFT JOIN family_privacy_settings fps 
    ON fps.user_id = fm.user_id
    AND fps.family_id = p_family_id
  WHERE fm.family_id = p_family_id
    AND fm.is_visible = true
  ORDER BY iman_score DESC;
END;
$function$;