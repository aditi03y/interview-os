-- Anti-cheating: violation event log tied to test attempts

create table public.test_violations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  test_attempt_id uuid references public.test_attempts (id) on delete cascade,
  event_type text not null
    check (event_type in (
      'tab_switch',
      'window_blur',
      'copy_attempt',
      'paste_attempt',
      'idle_time',
      'fullscreen_exit'
    )),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index test_violations_user_id_idx on public.test_violations (user_id, occurred_at desc);
create index test_violations_attempt_id_idx on public.test_violations (test_attempt_id, occurred_at desc);
create index test_violations_event_type_idx on public.test_violations (user_id, event_type);

alter table public.test_violations enable row level security;

create policy "test_violations_select_own"
  on public.test_violations for select
  using (auth.uid() = user_id);

create policy "test_violations_insert_own"
  on public.test_violations for insert
  with check (auth.uid() = user_id);

create policy "test_violations_delete_own"
  on public.test_violations for delete
  using (auth.uid() = user_id);
