-- Test sections, multi study-day scope, and negative marking support

alter table public.test_definitions
  add column if not exists covered_study_days integer[] not null default '{}',
  add column if not exists sections jsonb not null default '[]'::jsonb;

comment on column public.test_definitions.covered_study_days is
  'Study plan days (1–15) whose content this test may draw from';

comment on column public.test_definitions.sections is
  'Per-section config: question type, count, difficulty, duration, points, negative marking';

-- Validate study day values when array is non-empty
alter table public.test_definitions
  drop constraint if exists test_definitions_covered_study_days_range;

alter table public.test_definitions
  add constraint test_definitions_covered_study_days_range check (
    covered_study_days <@ array[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]::integer[]
  );
