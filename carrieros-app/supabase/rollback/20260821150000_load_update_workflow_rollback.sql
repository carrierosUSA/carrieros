-- Guarded rollback: disables future updates without deleting load history.
begin;

revoke all on function public.record_verified_load_update(
  uuid,text,text,text,timestamptz,text,text,text
) from authenticated;
drop function if exists public.record_verified_load_update(
  uuid,text,text,text,timestamptz,text,text,text
);

commit;
