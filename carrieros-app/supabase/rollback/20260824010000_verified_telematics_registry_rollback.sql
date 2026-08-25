-- Disable future telematics registry access without deleting verified connection or audit history.
begin;
revoke execute on function public.list_verified_telematics_connections(),public.save_verified_telematics_connection(uuid,text,text,text,text,text,text,timestamptz,text,text)from authenticated;
drop function if exists public.list_verified_telematics_connections();
drop function if exists public.save_verified_telematics_connection(uuid,text,text,text,text,text,text,timestamptz,text,text);
commit;
