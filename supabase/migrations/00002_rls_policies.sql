-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Daily plans: users can CRUD own
CREATE POLICY "Users can manage own daily plans" ON public.daily_plans
  FOR ALL USING (auth.uid() = user_id);

-- Habit check-ins: users can CRUD own
CREATE POLICY "Users can manage own habit check-ins" ON public.habit_check_ins
  FOR ALL USING (auth.uid() = user_id);

-- Prayer preferences: users can CRUD own
CREATE POLICY "Users can manage own prayer preferences" ON public.prayer_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Fasting sessions: users can CRUD own
CREATE POLICY "Users can manage own fasting sessions" ON public.fasting_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Learn content: public read (admin writes via service role)
CREATE POLICY "Anyone can read learn content" ON public.learn_content
  FOR SELECT USING (true);

-- Bookmarks: users can CRUD own
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Family groups: users can create; members can read; admins can update/delete
CREATE POLICY "Users can create family groups" ON public.family_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Family members can view group" ON public.family_groups
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = family_groups.id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Family admins can update delete group" ON public.family_groups
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = family_groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Family admins can delete group" ON public.family_groups
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = family_groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- Family members: members can view; admins can add; users can join via invite
CREATE POLICY "Family members view" ON public.family_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_members.family_id AND fm.user_id = auth.uid()
    )
  );
CREATE POLICY "Family admins add members" ON public.family_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_groups fg
      LEFT JOIN public.family_members fm ON fm.family_id = fg.id AND fm.user_id = auth.uid()
      WHERE fg.id = family_members.family_id
        AND (fg.created_by = auth.uid() OR (fm.role = 'admin'))
    )
  );
CREATE POLICY "Users can join via invite" ON public.family_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.family_invites fi
      JOIN auth.users u ON u.email = fi.email
      WHERE fi.family_id = family_members.family_id
        AND u.id = auth.uid()
        AND fi.expires_at > NOW()
    )
  );
CREATE POLICY "Family admins remove members" ON public.family_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.family_groups fg
      JOIN public.family_members fm ON fm.family_id = fg.id
      WHERE fg.id = family_members.family_id
        AND (fg.created_by = auth.uid() OR (fm.user_id = auth.uid() AND fm.role = 'admin'))
    )
  );

-- Family invites: invited users and family members can view
CREATE POLICY "Invited or family can view invites" ON public.family_invites
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = family_invites.family_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Family admins manage invites" ON public.family_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.family_groups fg
      JOIN public.family_members fm ON fm.family_id = fg.id
      WHERE fg.id = family_invites.family_id
        AND (fg.created_by = auth.uid() OR (fm.user_id = auth.uid() AND fm.role = 'admin'))
    )
  );

-- Movement logs: users can CRUD own
CREATE POLICY "Users can manage own movement logs" ON public.movement_logs
  FOR ALL USING (auth.uid() = user_id);

-- Admin users: only admins can read (service role for management)
CREATE POLICY "Admins can read admin_users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Ad slots: public read for active slots
CREATE POLICY "Anyone can read active ad slots" ON public.ad_slots
  FOR SELECT USING (active = true);

-- Admin policies: admins can manage learn_content and ad_slots
-- These require service role or custom function; for MVP we use service role in API routes
-- RLS allows read; admin dashboard will use service role key for writes
