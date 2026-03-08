
CREATE TABLE public.greetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_id UUID REFERENCES public.pins(id) ON DELETE CASCADE NOT NULL,
  sender_id TEXT NOT NULL DEFAULT 'anonymous',
  message TEXT NOT NULL DEFAULT '👋 Hi!',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.greetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert greetings" ON public.greetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read greetings" ON public.greetings FOR SELECT USING (true);

-- Add hi_count to pins for quick lookup
ALTER TABLE public.pins ADD COLUMN hi_count INTEGER NOT NULL DEFAULT 0;
