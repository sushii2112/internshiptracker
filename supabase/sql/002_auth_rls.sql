-- Run this in the Supabase SQL editor AFTER you have auth working and can sign in.
-- It scopes every table to the signed-in user (per-user data isolation).
--
-- How it works:
--   * user_id defaults to auth.uid(), so new rows are auto-stamped with the
--     current user — no client code changes needed.
--   * RLS policies let each user read/write ONLY their own rows.
--
-- NOTE: existing rows created before auth have user_id = NULL and become
-- invisible once RLS is on. After your first sign-in, find your user id in
-- Authentication -> Users, then optionally claim old rows, e.g.:
--   update applications set user_id = '<your-user-uuid>' where user_id is null;
-- (repeat per table) — or just delete the old test rows.

-- Helper: add user_id + enable RLS + owner policy for one table.
do $$
declare
  t text;
  tables text[] := array[
    'applications',
    'diary_entries',
    'reflections',
    'reflection_questions',
    'reflection_outputs'
  ];
begin
  foreach t in array tables loop
    execute format(
      'alter table %I add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid()',
      t
    );
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists %I on %I', t || '_owner', t);
    execute format(
      'create policy %I on %I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t || '_owner', t
    );
  end loop;
end $$;
