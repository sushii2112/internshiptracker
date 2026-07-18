-- Structured resume for the Resume Builder, stored per user on the profiles row.
-- Run this in the Supabase SQL editor. Safe to re-run.
-- Requires 003_profiles_resume.sql (creates the profiles table + RLS).

alter table profiles
  add column if not exists resume_data jsonb;
