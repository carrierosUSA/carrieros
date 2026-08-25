-- Guarded rollback: disable future closure operations without deleting links or history.
begin;
revoke all on function public.close_verified_load(uuid,text,boolean,text,text) from authenticated;
drop function if exists public.close_verified_load(uuid,text,boolean,text,text);
revoke all on function public.link_verified_closure_document(uuid,uuid,text) from authenticated;
drop function if exists public.link_verified_closure_document(uuid,uuid,text);
revoke all on function public.get_load_closure_readiness(uuid) from authenticated;
drop function if exists public.get_load_closure_readiness(uuid);
revoke all on function public.list_verified_closure_documents(uuid) from authenticated;
drop function if exists public.list_verified_closure_documents(uuid);
-- The helper and link table remain because they may contain operational audit evidence.
commit;
