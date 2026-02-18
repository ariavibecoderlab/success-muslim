
-- Add recurring transaction support
ALTER TABLE public.transactions
  ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN recurrence_interval TEXT CHECK (recurrence_interval IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  ADD COLUMN recurring_parent_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL;
