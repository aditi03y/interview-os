-- Curriculum sync + assignment evaluation linking

-- Link DSA tracker rows to study plan curriculum items
alter table public.dsa_progress
  add column if not exists roadmap_item_id text,
  add column if not exists study_day smallint
    check (study_day is null or (study_day >= 1 and study_day <= 15));

create unique index if not exists dsa_progress_user_roadmap_item_idx
  on public.dsa_progress (user_id, roadmap_item_id)
  where roadmap_item_id is not null;

create index if not exists dsa_progress_study_day_idx
  on public.dsa_progress (user_id, study_day);

-- Link GitHub evaluations to study plan assignments
alter table public.github_reviews
  add column if not exists study_day smallint
    check (study_day is null or (study_day >= 1 and study_day <= 15)),
  add column if not exists assignment_id text,
  add column if not exists assignment_title text;

create index if not exists github_reviews_assignment_idx
  on public.github_reviews (user_id, study_day, assignment_id)
  where assignment_id is not null;

-- Resource validation catalog (maintainable by admins)
create table if not exists public.resource_catalog (
  id text primary key,
  title text not null,
  url text not null,
  provider text not null default 'other',
  category text not null default 'general',
  status text not null default 'active'
    check (status in ('active', 'deprecated', 'broken', 'unknown')),
  fallback_url text,
  fallback_title text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resource_catalog enable row level security;

create policy "resource_catalog_select_all"
  on public.resource_catalog for select
  using (true);

create trigger resource_catalog_set_updated_at
  before update on public.resource_catalog
  for each row execute function public.set_updated_at();

-- Seed known resource overrides (broken YouTube → NeetCode fallback)
insert into public.resource_catalog (id, title, url, provider, category, status, fallback_url, fallback_title)
values
  (
    'd1-t2-r2',
    'Big-O Complexity (NeetCode)',
    'https://neetcode.io/courses/dsa-for-beginners/0',
    'neetcode',
    'theory',
    'active',
    'https://www.bigocheatsheet.com/',
    'Big-O Cheat Sheet'
  )
on conflict (id) do update set
  title = excluded.title,
  url = excluded.url,
  status = excluded.status,
  fallback_url = excluded.fallback_url,
  fallback_title = excluded.fallback_title,
  updated_at = now();
