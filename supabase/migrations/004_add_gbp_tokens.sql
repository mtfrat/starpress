-- Store Google Business Profile OAuth tokens
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.gbp_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  token_expiry timestamptz,
  account_id text,
  location_id text,
  business_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gbp_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own GBP tokens"
  ON public.gbp_tokens FOR all
  USING (auth.uid() = profile_id);

CREATE INDEX IF NOT EXISTS idx_gbp_tokens_profile_id ON public.gbp_tokens(profile_id);
