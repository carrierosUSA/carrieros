-- Disables future profitability reads without deleting any operational or financial records.
begin;
revoke execute on function public.list_verified_truck_profitability(date,date) from authenticated;
drop function if exists public.list_verified_truck_profitability(date,date);
commit;
