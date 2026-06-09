-- Configurable study plan content (days, items, resources, prompts)

-- ---------------------------------------------------------------------------
-- Core plan
-- ---------------------------------------------------------------------------
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger study_plans_set_updated_at
  before update on public.study_plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Days
-- ---------------------------------------------------------------------------
create table if not exists public.study_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.study_plans (id) on delete cascade,
  day_number integer not null check (day_number >= 1),
  title text not null,
  subtitle text not null default '',
  estimated_minutes integer not null default 180 check (estimated_minutes > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, day_number)
);

create index if not exists study_plan_days_plan_sort_idx
  on public.study_plan_days (plan_id, sort_order, day_number);

create trigger study_plan_days_set_updated_at
  before update on public.study_plan_days
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Theory / DSA / assignment items (IDs match legacy roadmap for progress sync)
-- ---------------------------------------------------------------------------
create table if not exists public.study_plan_items (
  id text primary key,
  day_id uuid not null references public.study_plan_days (id) on delete cascade,
  section text not null check (section in ('theory', 'dsa', 'assignment')),
  title text not null,
  description text,
  sort_order integer not null default 0,
  leetcode_slug text,
  difficulty text,
  topic text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_plan_items_day_section_idx
  on public.study_plan_items (day_id, section, sort_order);

create trigger study_plan_items_set_updated_at
  before update on public.study_plan_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Per-item resources
-- ---------------------------------------------------------------------------
create table if not exists public.study_plan_item_resources (
  id text primary key,
  item_id text not null references public.study_plan_items (id) on delete cascade,
  title text not null,
  url text not null,
  resource_type text check (resource_type in ('article', 'video', 'docs', 'problem')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_plan_item_resources_item_idx
  on public.study_plan_item_resources (item_id, sort_order);

create trigger study_plan_item_resources_set_updated_at
  before update on public.study_plan_item_resources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- AI prompt templates per day
-- ---------------------------------------------------------------------------
create table if not exists public.study_plan_prompts (
  id text primary key,
  day_id uuid not null references public.study_plan_days (id) on delete cascade,
  title text not null,
  prompt_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_plan_prompts_day_idx
  on public.study_plan_prompts (day_id, sort_order);

create trigger study_plan_prompts_set_updated_at
  before update on public.study_plan_prompts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.study_plans enable row level security;
alter table public.study_plan_days enable row level security;
alter table public.study_plan_items enable row level security;
alter table public.study_plan_item_resources enable row level security;
alter table public.study_plan_prompts enable row level security;

create policy "study_plans_select_authenticated"
  on public.study_plans for select to authenticated using (true);

create policy "study_plans_admin_write"
  on public.study_plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "study_plan_days_select_authenticated"
  on public.study_plan_days for select to authenticated using (true);

create policy "study_plan_days_admin_write"
  on public.study_plan_days for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "study_plan_items_select_authenticated"
  on public.study_plan_items for select to authenticated using (true);

create policy "study_plan_items_admin_write"
  on public.study_plan_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "study_plan_item_resources_select_authenticated"
  on public.study_plan_item_resources for select to authenticated using (true);

create policy "study_plan_item_resources_admin_write"
  on public.study_plan_item_resources for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "study_plan_prompts_select_authenticated"
  on public.study_plan_prompts for select to authenticated using (true);

create policy "study_plan_prompts_admin_write"
  on public.study_plan_prompts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Relax hardcoded 15-day limits (plan length is now configurable)
-- ---------------------------------------------------------------------------
alter table public.study_day_progress
  drop constraint if exists study_day_progress_day_number_check;

alter table public.study_day_progress
  add constraint study_day_progress_day_number_check check (day_number >= 1);

alter table public.dsa_progress
  drop constraint if exists dsa_progress_study_day_check;

alter table public.dsa_progress
  add constraint dsa_progress_study_day_check
  check (study_day is null or study_day >= 1);

alter table public.github_reviews
  drop constraint if exists github_reviews_study_day_check;

alter table public.github_reviews
  add constraint github_reviews_study_day_check
  check (study_day is null or study_day >= 1);

alter table public.test_definitions
  drop constraint if exists test_definitions_covered_study_days_range;

-- CHECK constraints cannot contain subqueries; validate via function instead.
create or replace function public.covered_study_days_valid(days integer[])
returns boolean
language sql
immutable
as $$
  select days = '{}'::integer[]
    or coalesce((select min(d) from unnest(days) as d), 1) >= 1
$$;

alter table public.test_definitions
  add constraint test_definitions_covered_study_days_range
  check (public.covered_study_days_valid(covered_study_days));

-- Default active plan shell (content seeded via one-time script)
insert into public.study_plans (slug, title, description, is_active)
values (
  'default',
  'SDE Intern Roadmap',
  'Configurable study plan — seed content from admin or migration script.',
  true
)
on conflict (slug) do nothing;
