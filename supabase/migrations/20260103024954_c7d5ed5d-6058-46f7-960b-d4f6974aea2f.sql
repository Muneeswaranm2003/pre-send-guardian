-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create monitored_domains table
CREATE TABLE public.monitored_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  ip_address TEXT,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  dkim_selector TEXT DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  last_check_at TIMESTAMP WITH TIME ZONE,
  spf_status TEXT,
  dkim_status TEXT,
  dmarc_status TEXT,
  blacklist_status TEXT DEFAULT 'unknown',
  overall_health INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blacklist_checks table
CREATE TABLE public.blacklist_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.monitored_domains(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  check_type TEXT NOT NULL, -- 'ip' or 'domain'
  is_listed BOOLEAN DEFAULT false,
  details TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monitoring_alerts table
CREATE TABLE public.monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.monitored_domains(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'blacklist', 'dns_fail', 'low_engagement'
  severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'critical'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create simulations table for history
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.monitored_domains(id) ON DELETE SET NULL,
  domain TEXT NOT NULL,
  ip_address TEXT,
  email_subject TEXT,
  email_content TEXT,
  send_volume INTEGER,
  risk_score INTEGER NOT NULL,
  risk_breakdown JSONB,
  issues JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitored_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Monitored domains policies
CREATE POLICY "Users can view their own domains" ON public.monitored_domains
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own domains" ON public.monitored_domains
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains" ON public.monitored_domains
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains" ON public.monitored_domains
  FOR DELETE USING (auth.uid() = user_id);

-- Blacklist checks policies
CREATE POLICY "Users can view blacklist checks for their domains" ON public.blacklist_checks
  FOR SELECT USING (
    domain_id IN (SELECT id FROM public.monitored_domains WHERE user_id = auth.uid())
  );

-- Monitoring alerts policies
CREATE POLICY "Users can view their own alerts" ON public.monitoring_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.monitoring_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Simulations policies
CREATE POLICY "Users can view their own simulations" ON public.simulations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own simulations" ON public.simulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monitored_domains_updated_at
  BEFORE UPDATE ON public.monitored_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();