-- Add widget_type column to widget_configs
-- Run this in Supabase SQL Editor

ALTER TABLE public.widget_configs
ADD COLUMN IF NOT EXISTS widget_type text NOT NULL DEFAULT 'list'
CHECK (widget_type IN ('list', 'carousel', 'badge'));
