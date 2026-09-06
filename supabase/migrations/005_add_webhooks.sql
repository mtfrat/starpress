-- Webhooks table for outbound event notifications
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  events text[] NOT NULL DEFAULT '{"feedback.received.negative"}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks"
  ON public.webhooks FOR all
  USING (
    EXISTS (
      SELECT 1 FROM public.locations
      WHERE locations.id = webhooks.location_id
      AND locations.profile_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_webhooks_location_id ON public.webhooks(location_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON public.webhooks(is_active) WHERE is_active = true;
