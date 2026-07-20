-- Custom user-defined tags per application (e.g. "backend", "big tech", "dream").
-- Run in the Supabase SQL editor. Safe to re-run.

alter table applications
  add column if not exists tags text[] not null default '{}';
