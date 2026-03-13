
-- Add profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS collaboration_style text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS collaboration_score numeric NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sessions_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS people_met_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cafes_visited integer NOT NULL DEFAULT 0;

-- Allow anyone to read profiles (for viewing other users)
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
-- Drop the old restrictive read policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- Cowork sessions
CREATE TABLE public.cowork_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id uuid NOT NULL,
  responder_id uuid NOT NULL,
  pin_id uuid REFERENCES public.pins(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE public.cowork_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own sessions" ON public.cowork_sessions FOR SELECT TO authenticated USING (auth.uid() = initiator_id OR auth.uid() = responder_id);
CREATE POLICY "Authenticated users can insert sessions" ON public.cowork_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY "Users can update own sessions" ON public.cowork_sessions FOR UPDATE TO authenticated USING (auth.uid() = initiator_id OR auth.uid() = responder_id);

-- Session reviews
CREATE TABLE public.session_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.cowork_sessions(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid NOT NULL,
  reviewee_id uuid NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  tags text[] NOT NULL DEFAULT '{}',
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.session_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read reviews about them" ON public.session_reviews FOR SELECT TO authenticated USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);
CREATE POLICY "Users can insert reviews" ON public.session_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Validation trigger for rating range
CREATE OR REPLACE FUNCTION public.validate_review_rating() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER check_review_rating BEFORE INSERT OR UPDATE ON public.session_reviews FOR EACH ROW EXECUTE FUNCTION public.validate_review_rating();

-- User badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read badges" ON public.user_badges FOR SELECT USING (true);

-- Allow anon to insert pins (for demo seeding)
CREATE POLICY "Anon can insert pins" ON public.pins FOR INSERT TO anon WITH CHECK (true);
