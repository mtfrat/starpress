-- Add sort_by column to widget_configs
-- Run this in Supabase SQL Editor

ALTER TABLE public.widget_configs
  ADD COLUMN IF NOT EXISTS sort_by text NOT NULL DEFAULT 'best';

-- Add check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'widget_configs_sort_by_check'
  ) THEN
    ALTER TABLE public.widget_configs
      ADD CONSTRAINT widget_configs_sort_by_check
      CHECK (sort_by IN ('best', 'recent', 'most_liked', 'highest', 'lowest'));
  END IF;
END $$;
