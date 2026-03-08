CREATE TABLE public.place_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  type text NOT NULL,
  address text NOT NULL,
  hours text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  contact_email text NOT NULL,
  contact_phone text NOT NULL DEFAULT '',
  has_wifi boolean NOT NULL DEFAULT false,
  has_power boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.place_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert place registrations"
ON public.place_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "No one can read place registrations"
ON public.place_registrations
FOR SELECT
TO authenticated
USING (false);