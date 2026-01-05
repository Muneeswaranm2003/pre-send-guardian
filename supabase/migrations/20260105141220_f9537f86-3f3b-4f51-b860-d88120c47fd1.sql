-- Add INSERT policy for monitoring_alerts table
-- Only allow inserts from service role (edge functions/backend)
-- Users cannot insert directly - only the system can create alerts

CREATE POLICY "Service role can insert monitoring alerts"
ON public.monitoring_alerts
FOR INSERT
TO service_role
WITH CHECK (true);

-- Restrictive policy for authenticated users that denies all inserts
CREATE POLICY "Users cannot insert monitoring alerts"
ON public.monitoring_alerts
FOR INSERT
TO authenticated
WITH CHECK (false);