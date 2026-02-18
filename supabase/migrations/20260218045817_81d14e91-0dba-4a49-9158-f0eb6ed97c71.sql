
-- =============================================
-- SALAH TRACKING
-- =============================================
CREATE TABLE public.salah_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  prayer_name TEXT NOT NULL, -- Fajr, Dhuhr, Asr, Maghrib, Isha
  status TEXT, -- ontime, late, missed, null
  logged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, prayer_name)
);
ALTER TABLE public.salah_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own salah" ON public.salah_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own salah" ON public.salah_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own salah" ON public.salah_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own salah" ON public.salah_logs FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- DHIKR
-- =============================================
CREATE TABLE public.dhikr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  preset_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL DEFAULT 33,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, preset_id)
);
ALTER TABLE public.dhikr_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own dhikr" ON public.dhikr_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dhikr" ON public.dhikr_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dhikr" ON public.dhikr_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dhikr" ON public.dhikr_sessions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- HEALTH: BMI
-- =============================================
CREATE TABLE public.health_bmi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  weight NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  activity_level TEXT NOT NULL DEFAULT 'sedentary',
  bmi NUMERIC NOT NULL,
  tdee INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_bmi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bmi" ON public.health_bmi FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bmi" ON public.health_bmi FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bmi" ON public.health_bmi FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- HEALTH: WEIGHT LOG
-- =============================================
CREATE TABLE public.weight_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.weight_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weight" ON public.weight_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight" ON public.weight_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight" ON public.weight_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight" ON public.weight_log FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- HEALTH: HYDRATION
-- =============================================
CREATE TABLE public.hydration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  cups INTEGER NOT NULL DEFAULT 0,
  goal INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.hydration_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hydration" ON public.hydration_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hydration" ON public.hydration_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hydration" ON public.hydration_log FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- HEALTH: SLEEP
-- =============================================
CREATE TABLE public.sleep_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  bedtime TEXT NOT NULL,
  wake_time TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.sleep_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sleep" ON public.sleep_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep" ON public.sleep_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep" ON public.sleep_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep" ON public.sleep_log FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- HEALTH: SUNNAH FASTING
-- =============================================
CREATE TABLE public.fasting_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.fasting_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fasting" ON public.fasting_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fasting" ON public.fasting_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own fasting" ON public.fasting_log FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- HEALTH: INTERMITTENT FASTING SESSIONS
-- =============================================
CREATE TABLE public.if_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mode TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  fasting_hours INTEGER NOT NULL DEFAULT 16,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.if_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own if" ON public.if_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own if" ON public.if_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own if" ON public.if_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own if" ON public.if_sessions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PRODUCTIVITY: DAILY TASKS
-- =============================================
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  is_mit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON public.daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.daily_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.daily_tasks FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_daily_tasks_user_date ON public.daily_tasks(user_id, date);

-- =============================================
-- PRODUCTIVITY: HABITS
-- =============================================
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Check',
  color TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PRODUCTIVITY: HABIT LOG
-- =============================================
CREATE TABLE public.habit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, habit_id, date)
);
ALTER TABLE public.habit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own habit log" ON public.habit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit log" ON public.habit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit log" ON public.habit_log FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_habit_log_user_date ON public.habit_log(user_id, date);

-- =============================================
-- PRODUCTIVITY: LIFE AREA SCORES
-- =============================================
CREATE TABLE public.life_area_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL, -- month start
  area TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, area)
);
ALTER TABLE public.life_area_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own life areas" ON public.life_area_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own life areas" ON public.life_area_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own life areas" ON public.life_area_scores FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- SUNNAH TRACKER
-- =============================================
CREATE TABLE public.sunnah_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  completed_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of item IDs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.sunnah_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sunnah" ON public.sunnah_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sunnah" ON public.sunnah_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sunnah" ON public.sunnah_log FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- QADA SOLAT
-- =============================================
CREATE TABLE public.qada_solat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  setup JSONB NOT NULL DEFAULT '{}'::jsonb,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.qada_solat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own qada" ON public.qada_solat FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own qada" ON public.qada_solat FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own qada" ON public.qada_solat FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own qada" ON public.qada_solat FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- RAMADHAN QADA
-- =============================================
CREATE TABLE public.ramadhan_qada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  setup JSONB NOT NULL DEFAULT '{}'::jsonb,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ramadhan_qada ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ramadhan" ON public.ramadhan_qada FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ramadhan" ON public.ramadhan_qada FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ramadhan" ON public.ramadhan_qada FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ramadhan" ON public.ramadhan_qada FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FIDYAH HISTORY
-- =============================================
CREATE TABLE public.fidyah_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fidyah_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fidyah" ON public.fidyah_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fidyah" ON public.fidyah_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- WEIGHT GOAL (user preferences)
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_goal NUMERIC;
