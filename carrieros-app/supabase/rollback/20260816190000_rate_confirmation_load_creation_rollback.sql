-- Guarded rollback: disables future conversion without deleting any load or audit history.
begin;

revoke all on function public.create_load_from_confirmed_rate_confirmation(uuid) from authenticated;
drop function if exists public.create_load_from_confirmed_rate_confirmation(uuid);
drop index if exists public.loads_one_source_document_uidx;

commit;
