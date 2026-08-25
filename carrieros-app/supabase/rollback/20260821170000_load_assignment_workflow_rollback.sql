-- Guarded rollback: disables future assignments without deleting operational history.
begin;

revoke all on function public.assign_verified_load(
  uuid,uuid,text,text,boolean,boolean,boolean,text,text
) from authenticated;
drop function if exists public.assign_verified_load(
  uuid,uuid,text,text,boolean,boolean,boolean,text,text
);

revoke all on function public.list_assignable_company_drivers() from authenticated;
drop function if exists public.list_assignable_company_drivers();

commit;
