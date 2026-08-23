begin;revoke execute on function public.list_verified_lane_performance(date,date)from authenticated;drop function if exists public.list_verified_lane_performance(date,date);commit;
