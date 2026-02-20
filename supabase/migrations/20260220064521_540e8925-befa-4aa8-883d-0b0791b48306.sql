
-- ============================================================
-- FAMILY MODULE — Phase 1 Database Migration
-- ============================================================

-- 1. families table
CREATE TABLE public.families (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  mode text NOT NULL DEFAULT 'family',
  created_by uuid NOT NULL,
  invite_code text UNIQUE NOT NULL,
  invite_link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. family_members table
CREATE TABLE public.family_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  is_visible boolean NOT NULL DEFAULT true,
  UNIQUE (family_id, user_id)
);

-- 3. family_activity_feed table
CREATE TABLE public.family_activity_feed (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. family_reactions table
CREATE TABLE public.family_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id uuid NOT NULL REFERENCES public.family_activity_feed(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feed_id, user_id, reaction_type)
);

-- 5. family_announcements table
CREATE TABLE public.family_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. family_privacy_settings table
CREATE TABLE public.family_privacy_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  show_prayer boolean NOT NULL DEFAULT true,
  show_quran boolean NOT NULL DEFAULT true,
  show_fasting boolean NOT NULL DEFAULT true,
  show_health boolean NOT NULL DEFAULT false,
  show_streaks boolean NOT NULL DEFAULT true,
  show_on_leaderboard boolean NOT NULL DEFAULT true,
  ghost_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_activity_feed_family_id ON public.family_activity_feed(family_id);
CREATE INDEX idx_family_reactions_feed_id ON public.family_reactions(feed_id);

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_privacy_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECURITY DEFINER HELPER — avoids RLS recursion
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_family_member(p_family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = p_family_id
      AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_family_admin(p_family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = p_family_id
      AND user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- ============================================================
-- RLS POLICIES — families
-- ============================================================
CREATE POLICY "Members can view their families"
  ON public.families FOR SELECT
  USING (public.is_family_member(id));

CREATE POLICY "Authenticated users can create families"
  ON public.families FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family admins can update family"
  ON public.families FOR UPDATE
  USING (public.is_family_admin(id));

CREATE POLICY "Family admins can delete family"
  ON public.families FOR DELETE
  USING (public.is_family_admin(id));

-- ============================================================
-- RLS POLICIES — family_members
-- ============================================================
CREATE POLICY "Members can view family members"
  ON public.family_members FOR SELECT
  USING (public.is_family_member(family_id));

CREATE POLICY "Authenticated users can join families"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update own membership"
  ON public.family_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any membership"
  ON public.family_members FOR UPDATE
  USING (public.is_family_admin(family_id));

CREATE POLICY "Members can leave family"
  ON public.family_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can remove members"
  ON public.family_members FOR DELETE
  USING (public.is_family_admin(family_id));

-- ============================================================
-- RLS POLICIES — family_activity_feed
-- ============================================================
CREATE POLICY "Members can view family feed"
  ON public.family_activity_feed FOR SELECT
  USING (public.is_family_member(family_id));

CREATE POLICY "Members can post to family feed"
  ON public.family_activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_family_member(family_id));

-- ============================================================
-- RLS POLICIES — family_reactions
-- ============================================================
CREATE POLICY "Members can view reactions"
  ON public.family_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_activity_feed af
      JOIN public.family_members fm ON fm.family_id = af.family_id
      WHERE af.id = feed_id AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can add reactions"
  ON public.family_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.family_activity_feed af
      JOIN public.family_members fm ON fm.family_id = af.family_id
      WHERE af.id = feed_id AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove own reactions"
  ON public.family_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES — family_announcements
-- ============================================================
CREATE POLICY "Members can view announcements"
  ON public.family_announcements FOR SELECT
  USING (public.is_family_member(family_id));

CREATE POLICY "Admins can post announcements"
  ON public.family_announcements FOR INSERT
  WITH CHECK (auth.uid() = admin_id AND public.is_family_admin(family_id));

CREATE POLICY "Admins can delete announcements"
  ON public.family_announcements FOR DELETE
  USING (public.is_family_admin(family_id));

-- ============================================================
-- RLS POLICIES — family_privacy_settings
-- ============================================================
CREATE POLICY "Users can view own privacy settings"
  ON public.family_privacy_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings"
  ON public.family_privacy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings"
  ON public.family_privacy_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- LEADERBOARD RPC — SECURITY DEFINER, returns aggregated scores
-- No raw personal data exposed to other members
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_family_leaderboard(p_family_id uuid)
RETURNS TABLE (
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
    -- Quran streak (consecutive target_met days up to today)
    COALESCE((
      WITH ranked AS (
        SELECT date,
               ROW_NUMBER() OVER (ORDER BY date DESC) AS rn
        FROM quran_daily_log
        WHERE user_id = fm.user_id
          AND target_met = true
          AND date <= CURRENT_DATE
      ),
      streaks AS (
        SELECT date, rn,
               (date - (rn || ' days')::interval)::date AS grp
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
  LEFT JOIN family_privacy_settings fps ON fps.user_id = fm.user_id
  WHERE fm.family_id = p_family_id
    AND fm.is_visible = true
  ORDER BY iman_score DESC;
END;
$$;

-- ============================================================
-- UPDATED_AT TRIGGER for families and family_privacy_settings
-- ============================================================
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_privacy_settings_updated_at
  BEFORE UPDATE ON public.family_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
