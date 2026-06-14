-- Compact study plan day numbers to 1..N (no gaps) without deleting any day.

create or replace function public.renumber_study_plan_days(p_plan_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offset constant integer := 100000;
  v_changed integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  if not exists (
    select 1
    from (
      select day_number, row_number() over (order by day_number, sort_order) as expected
      from public.study_plan_days
      where plan_id = p_plan_id
    ) x
    where day_number <> expected
  ) then
    return 0;
  end if;

  create temp table _day_remap on commit drop as
  select
    id,
    day_number as old_num,
    row_number() over (order by day_number, sort_order)::integer as new_num
  from public.study_plan_days
  where plan_id = p_plan_id;

  select count(*)::integer into v_changed
  from _day_remap
  where old_num <> new_num;

  if v_changed = 0 then
    return 0;
  end if;

  update public.study_plan_days
  set day_number = day_number + v_offset,
      sort_order = sort_order + v_offset
  where plan_id = p_plan_id;

  update public.study_plan_days d
  set day_number = m.new_num,
      sort_order = m.new_num
  from _day_remap m
  where d.id = m.id
    and d.plan_id = p_plan_id;

  update public.study_day_progress p
  set day_number = p.day_number + v_offset
  where p.day_number in (select old_num from _day_remap);

  update public.study_day_progress p
  set day_number = m.new_num
  from _day_remap m
  where p.day_number = m.old_num + v_offset;

  update public.dsa_progress
  set study_day = study_day + v_offset
  where study_day in (select old_num from _day_remap);

  update public.dsa_progress d
  set study_day = m.new_num
  from _day_remap m
  where d.study_day = m.old_num + v_offset;

  update public.github_reviews
  set study_day = study_day + v_offset
  where study_day in (select old_num from _day_remap);

  update public.github_reviews g
  set study_day = m.new_num
  from _day_remap m
  where g.study_day = m.old_num + v_offset;

  update public.test_questions
  set study_day = study_day + v_offset
  where study_day in (select old_num from _day_remap);

  update public.test_questions t
  set study_day = m.new_num
  from _day_remap m
  where t.study_day = m.old_num + v_offset;

  update public.test_definitions td
  set covered_study_days = (
    select coalesce(
      array_agg(
        coalesce(
          (select new_num from _day_remap where old_num = d),
          d
        )
        order by coalesce((select new_num from _day_remap where old_num = d), d)
      ),
      '{}'::integer[]
    )
    from unnest(td.covered_study_days) as d
  )
  where td.covered_study_days <> '{}'::integer[]
    and exists (
      select 1
      from unnest(td.covered_study_days) as d
      join _day_remap m on m.old_num = d
      where m.old_num <> m.new_num
    );

  return v_changed;
end;
$$;

revoke all on function public.renumber_study_plan_days(uuid) from public;
grant execute on function public.renumber_study_plan_days(uuid) to authenticated;
