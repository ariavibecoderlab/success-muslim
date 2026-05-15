-- MIGRATION 3: Admin Policies
-- Run this FOURTH (after 02_rls_policies.sql)

CREATE POLICY "Admins can insert learn content" ON public.learn_content
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can update learn content" ON public.learn_content
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can delete learn content" ON public.learn_content
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert ad slots" ON public.ad_slots
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can update ad slots" ON public.ad_slots
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can delete ad slots" ON public.ad_slots
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
