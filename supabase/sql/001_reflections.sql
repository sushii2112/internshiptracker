-- Run this once in the Supabase SQL editor (or `supabase db push` if you link the CLI).
-- Mirrors the no-auth, single-tenant setup already used by `applications` and `diary_entries`.

create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text,
  role text,
  source_text text,
  status text not null default 'draft', -- draft | in_progress | complete
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reflection_questions (
  id uuid primary key default gen_random_uuid(),
  reflection_id uuid not null references reflections(id) on delete cascade,
  order_index int not null,
  question_text text not null,
  notes text,
  polished_answer text,
  status text not null default 'unanswered', -- unanswered | drafted | polished
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reflection_outputs (
  id uuid primary key default gen_random_uuid(),
  reflection_id uuid not null references reflections(id) on delete cascade,
  output_type text not null, -- resume_bullets | linkedin | star_story
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists reflection_questions_reflection_id_idx on reflection_questions(reflection_id);
create index if not exists reflection_outputs_reflection_id_idx on reflection_outputs(reflection_id);
