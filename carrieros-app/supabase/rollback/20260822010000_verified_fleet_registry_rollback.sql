-- Guarded rollback: disables future fleet writes/gates and preserves fleet history.
begin;
drop trigger if exists load_assignments_verified_equipment on public.load_assignments;
drop function if exists public.enforce_verified_assignment_equipment();
revoke all on function public.save_verified_fleet_asset(uuid,text,text,text,integer,text,text,text,date,date,boolean,text,text) from authenticated;
drop function if exists public.save_verified_fleet_asset(uuid,text,text,text,integer,text,text,text,date,date,boolean,text,text);
revoke all on function public.list_verified_fleet_assets() from authenticated;
drop function if exists public.list_verified_fleet_assets();
-- Fleet tables remain because they contain operational and audit records.
commit;
