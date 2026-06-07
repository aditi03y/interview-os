-- Admin role + content management tables

-- ---------------------------------------------------------------------------
-- Admin role on users
-- ---------------------------------------------------------------------------
alter table public.users
  add column if not exists app_role text not null default 'user'
    check (app_role in ('user', 'admin'));

create index if not exists users_app_role_idx on public.users (app_role)
  where app_role = 'admin';

-- Promote your account after signup:
--   update public.users set app_role = 'admin' where email = 'you@example.com';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and app_role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- content_prompts — editable AI / test-generation guidance
-- ---------------------------------------------------------------------------
create table if not exists public.content_prompts (
  id text primary key,
  category text not null default 'test_generation',
  title text not null,
  description text,
  prompt_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users (id) on delete set null
);

create trigger content_prompts_set_updated_at
  before update on public.content_prompts
  for each row execute function public.set_updated_at();

alter table public.content_prompts enable row level security;

create policy "content_prompts_select_authenticated"
  on public.content_prompts for select
  to authenticated
  using (true);

create policy "content_prompts_admin_write"
  on public.content_prompts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.content_prompts (id, category, title, description, prompt_text)
values
  (
    'test_generation.overview',
    'test_generation',
    'Test generation overview',
    'Global rules when creating or reviewing test content',
    'You create SDE intern interview assessments. Balance DSA fundamentals, CS theory, and practical coding. Questions must be unambiguous, have clear grading criteria, and match the declared difficulty and question type (MCQ, subjective, or coding).'
  ),
  (
    'test_generation.mcq',
    'test_generation',
    'MCQ question style',
    'How MCQ questions should be written',
    'Write 4 options (A–D). Exactly one correct answer. Distractors should reflect common misconceptions. Include a concise stem and avoid trick wording. Tag with study_day and topic when applicable.'
  ),
  (
    'test_generation.subjective',
    'test_generation',
    'Subjective question style',
    'How short-answer / theory questions should be written',
    'Ask for structured answers (definition, example, trade-offs). Provide a rubric with 3–5 bullet points for full credit. Expected length: 3–8 sentences.'
  ),
  (
    'test_generation.coding',
    'test_generation',
    'Coding question style',
    'How coding problems should be written',
    'Provide clear I/O format, constraints, starter code when helpful, and 2–4 JSON test cases in metadata. Function name must match starter code. Prefer standard library only unless stated.'
  ),
  (
    'test_generation.difficulty.easy',
    'test_generation',
    'Easy difficulty',
    'Calibration for Easy questions',
    'Single concept, direct application, typical brute force or one pattern. Suitable for day 1–5 revision tests.'
  ),
  (
    'test_generation.difficulty.medium',
    'test_generation',
    'Medium difficulty',
    'Calibration for Medium questions',
    'Combines 2 concepts or requires choosing the right pattern. Standard intern interview level.'
  ),
  (
    'test_generation.difficulty.hard',
    'test_generation',
    'Hard difficulty',
    'Calibration for Hard questions',
    'Multi-step reasoning, optimization, or edge-case handling. Suitable for cumulative assessments.'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- prompt_library_items — runtime-managed prompt library
-- ---------------------------------------------------------------------------
create table if not exists public.prompt_library_items (
  id text primary key,
  title text not null,
  category text not null,
  description text not null default '',
  prompt text not null,
  tags text[] not null default '{}',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prompt_library_items_category_idx on public.prompt_library_items (category, sort_order);

create trigger prompt_library_items_set_updated_at
  before update on public.prompt_library_items
  for each row execute function public.set_updated_at();

alter table public.prompt_library_items enable row level security;

create policy "prompt_library_items_select_published"
  on public.prompt_library_items for select
  to authenticated
  using (is_published = true or public.is_admin());

create policy "prompt_library_items_admin_write"
  on public.prompt_library_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin RLS: tests
-- ---------------------------------------------------------------------------
drop policy if exists "test_definitions_select_authenticated" on public.test_definitions;

create policy "test_definitions_select_authenticated"
  on public.test_definitions for select
  to authenticated
  using (is_active = true or public.is_admin());

create policy "test_definitions_admin_insert"
  on public.test_definitions for insert
  to authenticated
  with check (public.is_admin());

create policy "test_definitions_admin_update"
  on public.test_definitions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "test_definitions_admin_delete"
  on public.test_definitions for delete
  to authenticated
  using (public.is_admin());

create policy "test_questions_admin_insert"
  on public.test_questions for insert
  to authenticated
  with check (public.is_admin());

create policy "test_questions_admin_update"
  on public.test_questions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "test_questions_admin_delete"
  on public.test_questions for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin RLS: resource catalog
-- ---------------------------------------------------------------------------
create policy "resource_catalog_admin_insert"
  on public.resource_catalog for insert
  to authenticated
  with check (public.is_admin());

create policy "resource_catalog_admin_update"
  on public.resource_catalog for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "resource_catalog_admin_delete"
  on public.resource_catalog for delete
  to authenticated
  using (public.is_admin());
