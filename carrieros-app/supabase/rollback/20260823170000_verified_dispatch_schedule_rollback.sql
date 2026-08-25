begin;revoke execute on function public.list_verified_dispatch_schedule(date,date)from authenticated;drop function if exists public.list_verified_dispatch_schedule(date,date);commit;
