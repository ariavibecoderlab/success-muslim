-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily plans (wake/sleep + 3 goals)
CREATE TABLE public.daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wake_time TIME NOT NULL,
  sleep_time TIME NOT NULL,
  goal_1 TEXT NOT NULL,
  goal_2 TEXT,
  goal_3 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habit check-ins (daily goal status)
CREATE TABLE public.habit_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.daily_plans(id) ON DELETE SET NULL,
  check_in_date DATE NOT NULL,
  goal_index INT NOT NULL CHECK (goal_index IN (1, 2, 3)),
  status TEXT NOT NULL CHECK (status IN ('done', 'partial', 'missed')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, check_in_date, goal_index)
);

-- Prayer preferences
CREATE TABLE public.prayer_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  calculation_method INT DEFAULT 2,
  suhoor_reminder_enabled BOOLEAN DEFAULT true,
  iftar_reminder_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fasting sessions
CREATE TABLE public.fasting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fasting_type TEXT NOT NULL CHECK (fasting_type IN (
    'ramadan', 'sunnah', 'ayyamul_bidh', 'if_16_8', 'if_18_6', 'omad', 'custom'
  )),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  target_hours INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learn content (CMS)
CREATE TABLE public.learn_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL CHECK (category IN ('soul', 'jasad', 'mind', 'emotion')),
  url TEXT,
  thumbnail_url TEXT,
  content_type TEXT CHECK (content_type IN ('tip', 'video', 'podcast', 'book')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.learn_content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Family groups
CREATE TABLE public.family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Family invites
CREATE TABLE public.family_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movement logs (Wellness)
CREATE TABLE public.movement_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('walk', 'run')),
  duration_min INT NOT NULL,
  distance_km DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad slots (monetization placeholder)
CREATE TABLE public.ad_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  placement TEXT NOT NULL,
  content_url TEXT,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER daily_plans_updated_at BEFORE UPDATE ON public.daily_plans
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER habit_check_ins_updated_at BEFORE UPDATE ON public.habit_check_ins
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER prayer_preferences_updated_at BEFORE UPDATE ON public.prayer_preferences
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER learn_content_updated_at BEFORE UPDATE ON public.learn_content
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER ad_slots_updated_at BEFORE UPDATE ON public.ad_slots
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
