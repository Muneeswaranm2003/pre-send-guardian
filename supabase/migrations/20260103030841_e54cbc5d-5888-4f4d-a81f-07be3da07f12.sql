-- Add alert_email column to monitored_domains table
ALTER TABLE public.monitored_domains 
ADD COLUMN alert_email TEXT;