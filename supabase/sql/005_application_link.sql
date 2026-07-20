-- Add an optional job-posting link to each application, for easy reference.
-- Run in the Supabase SQL editor. Safe to re-run.

alter table applications
  add column if not exists link text;
