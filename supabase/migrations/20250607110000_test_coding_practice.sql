-- Test reattempts, coding practice attempts, answer review

alter table public.test_definitions
  add column if not exists max_attempts integer
    check (max_attempts is null or max_attempts >= 1);

comment on column public.test_definitions.max_attempts is
  'Max completed attempts per user. NULL = unlimited.';

-- DSA practice sessions (untimed, from test question bank)
create table if not exists public.dsa_practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  question_id uuid not null references public.test_questions (id) on delete cascade,
  test_definition_id uuid references public.test_definitions (id) on delete set null,
  language text not null default 'javascript',
  code text not null,
  time_complexity text not null default '',
  space_complexity text not null default '',
  visible_results jsonb not null default '[]'::jsonb,
  hidden_results jsonb not null default '[]'::jsonb,
  score numeric not null default 0,
  max_score numeric not null default 0,
  complexity_time_correct boolean not null default false,
  complexity_space_correct boolean not null default false,
  ai_analysis text,
  created_at timestamptz not null default now()
);

create index if not exists dsa_practice_attempts_user_question_idx
  on public.dsa_practice_attempts (user_id, question_id, created_at desc);

alter table public.dsa_practice_attempts enable row level security;

create policy "dsa_practice_attempts_select_own"
  on public.dsa_practice_attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "dsa_practice_attempts_insert_own"
  on public.dsa_practice_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);
