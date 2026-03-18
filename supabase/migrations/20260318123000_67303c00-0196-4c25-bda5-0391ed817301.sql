
-- Allow authenticated users to insert badges (awarded after reviews)
CREATE POLICY "Authenticated users can insert badges"
ON public.user_badges
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
