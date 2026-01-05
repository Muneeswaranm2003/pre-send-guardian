-- Add INSERT policy for blacklist_checks table
-- Only allow inserts from service role (edge functions/backend)
-- Users cannot insert directly - only the system can create blacklist check records

CREATE POLICY "Service role can insert blacklist checks"
ON public.blacklist_checks
FOR INSERT
TO service_role
WITH CHECK (true);

-- Also add a restrictive policy for authenticated users that denies all inserts
CREATE POLICY "Users cannot insert blacklist checks"
ON public.blacklist_checks
FOR INSERT
TO authenticated
WITH CHECK (false);