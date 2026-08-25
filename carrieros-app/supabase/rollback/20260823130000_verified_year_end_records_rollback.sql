begin;revoke execute on function public.list_verified_year_end_records(integer)from authenticated;drop function if exists public.list_verified_year_end_records(integer);commit;
