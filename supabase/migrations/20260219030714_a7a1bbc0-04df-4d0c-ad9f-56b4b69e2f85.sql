
CREATE TABLE public.widget_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  widget_id text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  size text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, widget_id)
);

ALTER TABLE public.widget_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own widgets" ON public.widget_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own widgets" ON public.widget_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own widgets" ON public.widget_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own widgets" ON public.widget_preferences
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_widget_preferences_updated_at
  BEFORE UPDATE ON public.widget_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
