-- Create pins table for real-time co-working pins
CREATE TABLE public.pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('designer', 'developer', 'writer', 'marketer', 'other')),
  time_slot TEXT NOT NULL CHECK (time_slot IN ('now', 'morning', 'afternoon', 'evening')),
  interests TEXT[] NOT NULL DEFAULT '{}',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '4 hours')
);

-- Enable RLS
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

-- Anyone can read pins (anonymous, no auth required for MVP)
CREATE POLICY "Anyone can read pins" ON public.pins
  FOR SELECT USING (true);

-- Anyone can insert pins (anonymous for MVP)
CREATE POLICY "Anyone can insert pins" ON public.pins
  FOR INSERT WITH CHECK (true);

-- Anyone can delete expired pins
CREATE POLICY "Anyone can delete pins" ON public.pins
  FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pins;

-- Index for geo queries and expiry
CREATE INDEX idx_pins_expires_at ON public.pins (expires_at);
CREATE INDEX idx_pins_location ON public.pins (lat, lng);