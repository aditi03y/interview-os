-- DSA Tracker enhancements: attempts, time taken, status

alter table public.dsa_progress
  add column if not exists attempts integer not null default 1
    check (attempts >= 1),
  add column if not exists time_taken_minutes integer
    check (time_taken_minutes is null or time_taken_minutes >= 0),
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'solved', 'revisit'));

-- Backfill status from legacy solved flag
update public.dsa_progress
set status = case when solved then 'solved' else 'pending' end
where status = 'pending' and solved = true;

create index if not exists dsa_progress_status_idx
  on public.dsa_progress (user_id, status);

create index if not exists dsa_progress_solved_at_idx
  on public.dsa_progress (user_id, solved_at desc)
  where solved_at is not null;
