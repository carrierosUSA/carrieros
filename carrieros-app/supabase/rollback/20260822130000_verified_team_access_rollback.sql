-- Destructive rollback. Review before applying.
begin;
drop function if exists public.revoke_verified_team_access_request(uuid,text,text);
drop function if exists public.prepare_verified_team_access_request(text,text,uuid,text,timestamptz,text,text);
drop function if exists public.list_verified_team_access_requests();
drop table if exists public.team_access_request_events;
drop table if exists public.team_access_requests;
commit;
