CREATE TABLE public.domain_check_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain_id uuid NOT NULL REFERENCES public.monitored_domains(id) ON DELETE CASCADE,
  domain text NOT NULL,
  spf_status text,
  dkim_status text,
  dmarc_status text,
  auth_score integer NOT NULL DEFAULT 0,
  blacklist_status text NOT NULL DEFAULT 'unknown',
  listed_count integer NOT NULL DEFAULT 0,
  reputation_score integer,
  health_score integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'manual',
  checked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.domain_check_history TO authenticated;
GRANT ALL ON public.domain_check_history TO service_role;
ALTER TABLE public.domain_check_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own check history" ON public.domain_check_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own check history" ON public.domain_check_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND domain_id IN (SELECT id FROM public.monitored_domains WHERE user_id = auth.uid()));
CREATE INDEX domain_check_history_user_time ON public.domain_check_history(user_id, checked_at DESC);

CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  last_risk_score integer,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own templates" ON public.email_templates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own templates" ON public.email_templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own templates" ON public.email_templates FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own templates" ON public.email_templates FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.warmup_ai_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.warmup_plans(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.warmup_ai_reviews TO authenticated;
GRANT ALL ON public.warmup_ai_reviews TO service_role;
ALTER TABLE public.warmup_ai_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own warmup reviews" ON public.warmup_ai_reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own warmup reviews" ON public.warmup_ai_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND plan_id IN (SELECT id FROM public.warmup_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own warmup reviews" ON public.warmup_ai_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);