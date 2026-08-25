-- Guarded rollback: disables future driver compliance writes/gates and preserves history.
begin;
drop trigger if exists load_assignments_verified_driver on public.load_assignments;
drop function if exists public.enforce_verified_assignment_driver();
revoke all on function public.save_verified_driver_profile(uuid,uuid,text,text,date,date,date,text,text,text) from authenticated;
drop function if exists public.save_verified_driver_profile(uuid,uuid,text,text,date,date,date,text,text,text);
revoke all on function public.list_unprofiled_company_drivers() from authenticated;
drop function if exists public.list_unprofiled_company_drivers();
revoke all on function public.list_verified_driver_profiles() from authenticated;
drop function if exists public.list_verified_driver_profiles();
-- Driver profile tables remain because they contain compliance and audit records.
commit;
