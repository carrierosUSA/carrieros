-- Guarded rollback: disables future maintenance writes/gates and preserves records.
begin;
drop trigger if exists load_assignments_no_critical_maintenance on public.load_assignments;
drop function if exists public.enforce_no_open_critical_maintenance();
revoke all on function public.save_verified_maintenance_order(uuid,uuid,text,text,text,text,text,integer,timestamptz,date,text,text,date,integer,text) from authenticated;
drop function if exists public.save_verified_maintenance_order(uuid,uuid,text,text,text,text,text,integer,timestamptz,date,text,text,date,integer,text);
revoke all on function public.list_verified_maintenance_orders() from authenticated;
drop function if exists public.list_verified_maintenance_orders();
-- Work-order and audit tables remain as operational history.
commit;
