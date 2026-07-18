-- Resume storage: an editable text version (for the AI) + a private PDF file.
-- Run this in the Supabase SQL editor. Safe to re-run.

-- 1) profiles: one row per user, holds the resume text + a pointer to the PDF.
create table if not exists profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  resume_text text,
  resume_path text,                       -- path in the "resumes" storage bucket
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists profiles_owner on profiles;
create policy profiles_owner on profiles
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2) A PRIVATE storage bucket for resume PDFs.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- 3) Storage policies: each user can only touch files under a folder named
--    with their own user id, e.g. resumes/<uid>/resume.pdf
drop policy if exists resumes_select on storage.objects;
drop policy if exists resumes_insert on storage.objects;
drop policy if exists resumes_update on storage.objects;
drop policy if exists resumes_delete on storage.objects;

create policy resumes_select on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy resumes_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy resumes_update on storage.objects
  for update to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy resumes_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
