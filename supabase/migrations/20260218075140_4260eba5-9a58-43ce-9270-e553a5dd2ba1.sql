
-- Sadaqah donations table
CREATE TABLE public.sadaqah_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MYR',
  category TEXT NOT NULL DEFAULT 'sadaqah',
  recipient TEXT,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sadaqah_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sadaqah" ON public.sadaqah_donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sadaqah" ON public.sadaqah_donations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sadaqah" ON public.sadaqah_donations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sadaqah" ON public.sadaqah_donations FOR DELETE USING (auth.uid() = user_id);

-- Sadaqah goals table
CREATE TABLE public.sadaqah_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  monthly_target NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MYR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sadaqah_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sadaqah goals" ON public.sadaqah_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sadaqah goals" ON public.sadaqah_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sadaqah goals" ON public.sadaqah_goals FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_sadaqah_goals_updated_at BEFORE UPDATE ON public.sadaqah_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Zakat history table (replaces localStorage)
CREATE TABLE public.zakat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_wealth NUMERIC NOT NULL DEFAULT 0,
  net_zakatable NUMERIC NOT NULL DEFAULT 0,
  zakat_amount NUMERIC NOT NULL DEFAULT 0,
  nisab_gold NUMERIC NOT NULL DEFAULT 0,
  nisab_silver NUMERIC NOT NULL DEFAULT 0,
  meets_nisab BOOLEAN NOT NULL DEFAULT false,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_date DATE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.zakat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own zakat" ON public.zakat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own zakat" ON public.zakat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own zakat" ON public.zakat_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own zakat" ON public.zakat_history FOR DELETE USING (auth.uid() = user_id);
