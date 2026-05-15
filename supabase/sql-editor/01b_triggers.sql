-- MIGRATION 1 PART B: Triggers
-- Run this SECOND (after 01a_tables.sql succeeds)

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
