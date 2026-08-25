-- Destructive rollback. Review before applying.
begin;
drop function if exists public.save_verified_broker_profile(uuid,text,text,text,text,text,integer,text,text,text);
drop function if exists public.list_verified_broker_profiles();
drop table if exists public.broker_profile_events;
drop table if exists public.broker_profiles;
commit;
