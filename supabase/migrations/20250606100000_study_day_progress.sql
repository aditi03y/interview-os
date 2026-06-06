-- Study Plan: per-day progress for 15-day SDE roadmap

create table public.study_day_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  day_number smallint not null
    check (day_number >= 1 and day_number <= 15),
  notes text not null default '',
  time_spent_minutes integer not null default 0
    check (time_spent_minutes >= 0),
  completed_items jsonb not null default '{"theory":[],"dsa":[],"assignment":[]}'::jsonb,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent smallint not null default 0
    check (progress_percent >= 0 and progress_percent <= 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day_number),
  constraint study_day_progress_completed_items_shape check (
    jsonb_typeof(completed_items) = 'object'
    and completed_items ? 'theory'
    and completed_items ? 'dsa'
    and completed_items ? 'assignment'
  )
);

create index study_day_progress_user_id_idx on public.study_day_progress (user_id);
create index study_day_progress_user_day_idx on public.study_day_progress (user_id, day_number);

create trigger study_day_progress_set_updated_at
  before update on public.study_day_progress
  for each row execute function public.set_updated_at();

alter table public.study_day_progress enable row level security;

create policy "study_day_progress_select_own"
  on public.study_day_progress for select
  using (auth.uid() = user_id);

create policy "study_day_progress_insert_own"
  on public.study_day_progress for insert
  with check (auth.uid() = user_id);

create policy "study_day_progress_update_own"
  on public.study_day_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "study_day_progress_delete_own"
  on public.study_day_progress for delete
  using (auth.uid() = user_id);
