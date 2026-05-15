
-- Create steps_logs table
CREATE TABLE public.steps_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL,
  steps integer NOT NULL,
  activity_type text NOT NULL DEFAULT 'walking',
  distance_meters numeric NOT NULL DEFAULT 0,
  calories_burned numeric NOT NULL DEFAULT 0,
  logged_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.steps_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own steps" ON public.steps_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own steps" ON public.steps_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own steps" ON public.steps_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own steps" ON public.steps_logs FOR DELETE USING (auth.uid() = user_id);

-- Create steps_preferences table
CREATE TABLE public.steps_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  daily_target integer NOT NULL DEFAULT 10000,
  stride_length_cm numeric NOT NULL DEFAULT 76.2,
  reminder_enabled boolean NOT NULL DEFAULT false,
  reminder_time text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.steps_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own steps prefs" ON public.steps_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own steps prefs" ON public.steps_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own steps prefs" ON public.steps_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own steps prefs" ON public.steps_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_steps_preferences_updated_at
  BEFORE UPDATE ON public.steps_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
