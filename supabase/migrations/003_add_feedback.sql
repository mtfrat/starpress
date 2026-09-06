-- Create feedback table for Review Gating QR
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  contact text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Only the location owner can see feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR select
  USING (
    exists (
      select 1 from public.locations
      where locations.id = feedback.location_id
      and locations.profile_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert feedback (public QR page)"
  ON public.feedback FOR insert
  with check (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_feedback_location_id ON public.feedback(location_id);
