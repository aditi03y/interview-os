-- InterviewOS Initial Schema
-- Run via: supabase db push  OR  paste into Supabase SQL Editor

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Utility: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- users (profile table linked to auth.users)
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  college text,
  target_role text,
  github_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_not_empty check (char_length(trim(email)) > 0)
);

create index users_email_idx on public.users (email);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- study_progress
-- ---------------------------------------------------------------------------
create table public.study_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  module_id text not null,
  module_name text not null,
  phase text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent smallint not null default 0
    check (progress_percent >= 0 and progress_percent <= 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create index study_progress_user_id_idx on public.study_progress (user_id);

create trigger study_progress_set_updated_at
  before update on public.study_progress
  for each row execute function public.set_updated_at();

alter table public.study_progress enable row level security;

create policy "study_progress_select_own"
  on public.study_progress for select
  using (auth.uid() = user_id);

create policy "study_progress_insert_own"
  on public.study_progress for insert
  with check (auth.uid() = user_id);

create policy "study_progress_update_own"
  on public.study_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "study_progress_delete_own"
  on public.study_progress for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- dsa_progress
-- ---------------------------------------------------------------------------
create table public.dsa_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  problem_title text not null,
  platform text not null default 'LeetCode',
  difficulty text not null
    check (difficulty in ('Easy', 'Medium', 'Hard')),
  pattern text,
  problem_url text,
  solved boolean not null default false,
  notes text,
  solved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dsa_progress_title_not_empty check (char_length(trim(problem_title)) > 0)
);

create index dsa_progress_user_id_idx on public.dsa_progress (user_id);
create index dsa_progress_solved_idx on public.dsa_progress (user_id, solved);

create trigger dsa_progress_set_updated_at
  before update on public.dsa_progress
  for each row execute function public.set_updated_at();

alter table public.dsa_progress enable row level security;

create policy "dsa_progress_select_own"
  on public.dsa_progress for select
  using (auth.uid() = user_id);

create policy "dsa_progress_insert_own"
  on public.dsa_progress for insert
  with check (auth.uid() = user_id);

create policy "dsa_progress_update_own"
  on public.dsa_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "dsa_progress_delete_own"
  on public.dsa_progress for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- tests
-- ---------------------------------------------------------------------------
create table public.tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  test_type text not null
    check (test_type in ('MCQ', 'Coding', 'Mixed')),
  difficulty text
    check (difficulty is null or difficulty in ('Easy', 'Medium', 'Hard')),
  score numeric(5, 2),
  max_score numeric(5, 2) not null default 100,
  duration_minutes integer,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'abandoned')),
  proctored boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tests_title_not_empty check (char_length(trim(title)) > 0),
  constraint tests_score_range check (
    score is null or (score >= 0 and score <= max_score)
  )
);

create index tests_user_id_idx on public.tests (user_id);
create index tests_status_idx on public.tests (user_id, status);

create trigger tests_set_updated_at
  before update on public.tests
  for each row execute function public.set_updated_at();

alter table public.tests enable row level security;

create policy "tests_select_own"
  on public.tests for select
  using (auth.uid() = user_id);

create policy "tests_insert_own"
  on public.tests for insert
  with check (auth.uid() = user_id);

create policy "tests_update_own"
  on public.tests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tests_delete_own"
  on public.tests for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  linked_module_id text,
  linked_problem_id uuid references public.dsa_progress (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_title_not_empty check (char_length(trim(title)) > 0)
);

create index notes_user_id_idx on public.notes (user_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

alter table public.notes enable row level security;

create policy "notes_select_own"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "notes_insert_own"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "notes_update_own"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notes_delete_own"
  on public.notes for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- github_reviews
-- ---------------------------------------------------------------------------
create table public.github_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  github_username text not null,
  repo_name text not null,
  repo_url text,
  language text,
  stars integer not null default 0,
  score smallint
    check (score is null or (score >= 0 and score <= 100)),
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint github_reviews_repo_not_empty check (char_length(trim(repo_name)) > 0)
);

create index github_reviews_user_id_idx on public.github_reviews (user_id);

alter table public.github_reviews enable row level security;

create policy "github_reviews_select_own"
  on public.github_reviews for select
  using (auth.uid() = user_id);

create policy "github_reviews_insert_own"
  on public.github_reviews for insert
  with check (auth.uid() = user_id);

create policy "github_reviews_update_own"
  on public.github_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "github_reviews_delete_own"
  on public.github_reviews for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- analytics
-- ---------------------------------------------------------------------------
create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  metric_date date not null,
  problems_solved integer not null default 0
    check (problems_solved >= 0),
  study_hours numeric(5, 2) not null default 0
    check (study_hours >= 0),
  tests_completed integer not null default 0
    check (tests_completed >= 0),
  streak_days integer not null default 0
    check (streak_days >= 0),
  readiness_score smallint
    check (readiness_score is null or (readiness_score >= 0 and readiness_score <= 100)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, metric_date)
);

create index analytics_user_date_idx on public.analytics (user_id, metric_date desc);

create trigger analytics_set_updated_at
  before update on public.analytics
  for each row execute function public.set_updated_at();

alter table public.analytics enable row level security;

create policy "analytics_select_own"
  on public.analytics for select
  using (auth.uid() = user_id);

create policy "analytics_insert_own"
  on public.analytics for insert
  with check (auth.uid() = user_id);

create policy "analytics_update_own"
  on public.analytics for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "analytics_delete_own"
  on public.analytics for delete
  using (auth.uid() = user_id);
