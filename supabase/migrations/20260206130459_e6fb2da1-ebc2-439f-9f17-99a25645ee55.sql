
-- Create warmup plans table
CREATE TABLE public.warmup_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  domain_age TEXT NOT NULL,
  target_daily_volume INTEGER NOT NULL DEFAULT 1000,
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  alert_email TEXT,
  alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warmup daily logs
CREATE TABLE public.warmup_daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.warmup_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  recommended_volume INTEGER NOT NULL,
  actual_volume INTEGER,
  bounce_rate NUMERIC(5,2),
  complaint_rate NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'issue')),
  notes TEXT,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warmup_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warmup_daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for warmup_plans
CREATE POLICY "Users can view their own warmup plans"
  ON public.warmup_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own warmup plans"
  ON public.warmup_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own warmup plans"
  ON public.warmup_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own warmup plans"
  ON public.warmup_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for warmup_daily_logs
CREATE POLICY "Users can view their own warmup logs"
  ON public.warmup_daily_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own warmup logs"
  ON public.warmup_daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own warmup logs"
  ON public.warmup_daily_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_warmup_plans_updated_at
  BEFORE UPDATE ON public.warmup_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_warmup_daily_logs_plan_id ON public.warmup_daily_logs(plan_id);
CREATE INDEX idx_warmup_plans_user_id ON public.warmup_plans(user_id);
