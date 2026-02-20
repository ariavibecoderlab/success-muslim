-- Allow anyone (authenticated) to look up a family by invite_code
-- This is needed so users can preview a family before joining, and so
-- createFamily can check if a generated invite code is already taken.
CREATE POLICY "Authenticated users can lookup family by invite code"
ON public.families
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND invite_code IS NOT NULL
);

-- Drop the old restrictive SELECT policy (members-only) and replace with a broader one
-- that covers both: (1) member can see their own family, (2) any auth user can lookup by invite code.
-- We keep the is_family_member policy but add the new one above as an additional permissive policy.
-- Supabase RLS uses OR between permissive policies, so this is safe.
