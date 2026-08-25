-- Guarded rollback: removes only the future-release gate and preserves all load history.
begin;

drop trigger if exists loads_verified_dispatch_release on public.loads;
drop function if exists public.enforce_verified_dispatch_release();

commit;
