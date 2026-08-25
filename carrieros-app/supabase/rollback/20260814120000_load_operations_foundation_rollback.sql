-- Guarded manual rollback. Refuses to delete operational records.
begin;
do $$ begin
  if to_regclass('public.loads') is not null and exists (select 1 from public.loads limit 1) then
    raise exception 'Rollback refused: public.loads contains operational records.';
  end if;
end $$;

drop policy if exists load_detention_evidence_dispatch_write on public.load_detention_evidence;
drop policy if exists load_detention_authorized_select on public.load_detention_evidence;
drop policy if exists load_notes_human_insert on public.load_notes;
drop policy if exists load_notes_authorized_select on public.load_notes;
drop policy if exists load_financials_authorized_write on public.load_financials;
drop policy if exists load_financials_authorized_select on public.load_financials;
drop policy if exists load_events_human_insert on public.load_events;
drop policy if exists load_events_authorized_select on public.load_events;
drop policy if exists load_assignments_dispatch_write on public.load_assignments;
drop policy if exists load_assignments_authorized_select on public.load_assignments;
drop policy if exists load_stops_dispatch_write on public.load_stops;
drop policy if exists load_stops_authorized_select on public.load_stops;
drop policy if exists loads_dispatch_update on public.loads;
drop policy if exists loads_dispatch_insert on public.loads;
drop policy if exists loads_authorized_select on public.loads;

drop table if exists public.load_detention_evidence;
drop table if exists public.load_notes;
drop table if exists public.load_financials;
drop table if exists public.load_events;
drop table if exists public.load_assignments;
drop table if exists public.load_stops;
drop table if exists public.loads;
drop function if exists public.can_read_load(uuid);
commit;
