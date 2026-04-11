
-- PHASE 1: CRITICAL FIXES

-- 1A. Lock down user_roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 1B. Fix family invite code exposure
DROP POLICY IF EXISTS "Authenticated users can lookup family by invite code" ON public.families;

CREATE OR REPLACE FUNCTION public.lookup_family_by_invite(p_code text)
RETURNS TABLE(id uuid, name text, group_type text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.name, f.group_type
  FROM families f
  WHERE f.invite_code = p_code
  LIMIT 1;
$$;

-- PHASE 2: WARNING FIXES

CREATE POLICY "Users can delete own hydration"
ON public.hydration_log FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life areas"
ON public.life_area_scores FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sadaqah goals"
ON public.sadaqah_goals FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily log"
ON public.quran_daily_log FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sunnah log"
ON public.sunnah_log FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sunnah log"
ON public.sunnah_log FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feed posts"
ON public.family_activity_feed FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fidyah"
ON public.fidyah_history FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
ON public.quran_bookmarks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own memorization"
ON public.quran_memorization FOR UPDATE
USING (auth.uid() = user_id);
