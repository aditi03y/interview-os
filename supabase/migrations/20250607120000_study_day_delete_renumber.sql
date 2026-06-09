-- When a study plan day is deleted, renumber later days and shift related references.

create or replace function public.delete_study_plan_day_and_renumber(
  p_plan_id uuid,
  p_day_number integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day_id uuid;
  v_offset constant integer := 100000;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  select id into v_day_id
  from public.study_plan_days
  where plan_id = p_plan_id
    and day_number = p_day_number;

  if v_day_id is null then
    raise exception 'Day % not found', p_day_number;
  end if;

  delete from public.study_plan_days where id = v_day_id;

  -- Two-phase renumber with a high offset (avoids unique conflicts and check constraints).
  update public.study_plan_days
  set day_number = day_number + v_offset
  where plan_id = p_plan_id
    and day_number > p_day_number;

  update public.study_plan_days
  set day_number = day_number - v_offset - 1,
      sort_order = day_number - v_offset - 1
  where plan_id = p_plan_id
    and day_number > v_offset;

  delete from public.study_day_progress where day_number = p_day_number;

  update public.study_day_progress
  set day_number = day_number + v_offset
  where day_number > p_day_number;

  update public.study_day_progress
  set day_number = day_number - v_offset - 1
  where day_number > v_offset;

  update public.dsa_progress
  set study_day = null
  where study_day = p_day_number;

  update public.dsa_progress
  set study_day = study_day + v_offset
  where study_day > p_day_number;

  update public.dsa_progress
  set study_day = study_day - v_offset - 1
  where study_day > v_offset;

  update public.github_reviews
  set study_day = null
  where study_day = p_day_number;

  update public.github_reviews
  set study_day = study_day + v_offset
  where study_day > p_day_number;

  update public.github_reviews
  set study_day = study_day - v_offset - 1
  where study_day > v_offset;

  update public.test_questions
  set study_day = null
  where study_day = p_day_number;

  update public.test_questions
  set study_day = study_day + v_offset
  where study_day > p_day_number;

  update public.test_questions
  set study_day = study_day - v_offset - 1
  where study_day > v_offset;

  -- Admin-configured covered study days on test definitions
  update public.test_definitions
  set covered_study_days = (
    select coalesce(
      array_agg(
        case when d > p_day_number then d - 1 else d end
        order by case when d > p_day_number then d - 1 else d end
      ),
      '{}'::integer[]
    )
    from unnest(covered_study_days) as d
    where d <> p_day_number
  )
  where covered_study_days <> '{}'::integer[]
    and (
      p_day_number = any (covered_study_days)
      or exists (
        select 1 from unnest(covered_study_days) as d where d > p_day_number
      )
    );
end;
$$;

revoke all on function public.delete_study_plan_day_and_renumber(uuid, integer) from public;
grant execute on function public.delete_study_plan_day_and_renumber(uuid, integer) to authenticated;
