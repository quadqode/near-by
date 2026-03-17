
-- Delete existing greetings (old anonymous data)
DELETE FROM public.greetings;

-- Drop the old sender_id column (was text 'anonymous') and recreate as uuid
ALTER TABLE public.greetings DROP COLUMN sender_id;
ALTER TABLE public.greetings ADD COLUMN sender_id uuid NOT NULL;

-- Drop existing RLS policies on greetings
DROP POLICY IF EXISTS "Anyone can insert greetings" ON public.greetings;
DROP POLICY IF EXISTS "Anyone can read greetings" ON public.greetings;

-- New RLS policies
CREATE POLICY "Authenticated users can send hi"
  ON public.greetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read greetings they sent or received"
  ON public.greetings FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() 
    OR pin_id IN (SELECT id FROM public.pins WHERE user_id = auth.uid())
  );

CREATE POLICY "Pin owners can update greeting status"
  ON public.greetings FOR UPDATE
  TO authenticated
  USING (
    pin_id IN (SELECT id FROM public.pins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    pin_id IN (SELECT id FROM public.pins WHERE user_id = auth.uid())
  );

-- Enable realtime for greetings
ALTER PUBLICATION supabase_realtime ADD TABLE public.greetings;
