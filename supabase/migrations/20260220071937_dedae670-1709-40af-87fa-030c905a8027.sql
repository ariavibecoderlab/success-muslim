
-- Allow family members to read each other's basic profile info (display_name, avatar_url)
-- This is needed for the activity feed and leaderboard member names to load correctly
CREATE POLICY "Family members can read basic profile info"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM family_members fm1
    JOIN family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid()
      AND fm2.user_id = profiles.id
  )
);
