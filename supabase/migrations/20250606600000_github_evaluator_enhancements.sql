-- GitHub Evaluator: extended scores and full report storage

alter table public.github_reviews
  add column if not exists documentation_score smallint
    check (documentation_score is null or (documentation_score >= 0 and documentation_score <= 100)),
  add column if not exists structure_score smallint
    check (structure_score is null or (structure_score >= 0 and structure_score <= 100)),
  add column if not exists engineering_score smallint
    check (engineering_score is null or (engineering_score >= 0 and engineering_score <= 100)),
  add column if not exists summary text,
  add column if not exists report jsonb not null default '{}'::jsonb,
  add column if not exists repo_metadata jsonb not null default '{}'::jsonb;

-- score column doubles as overall quality_score
comment on column public.github_reviews.score is 'Overall quality score (0-100)';
