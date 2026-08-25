-- Guarded rollback: disables future payroll writes and preserves all rates, settlements, load lines, and audit events.
begin;
revoke all on function public.record_verified_driver_settlement_payment(uuid,timestamptz,text,text) from authenticated;
drop function if exists public.record_verified_driver_settlement_payment(uuid,timestamptz,text,text);
revoke all on function public.approve_verified_driver_settlement(uuid,date,date,uuid[],bigint,bigint,text,text) from authenticated;
drop function if exists public.approve_verified_driver_settlement(uuid,date,date,uuid[],bigint,bigint,text,text);
revoke all on function public.save_verified_driver_pay_rate(uuid,integer,date,text,text) from authenticated;
drop function if exists public.save_verified_driver_pay_rate(uuid,integer,date,text,text);
revoke all on function public.list_verified_driver_settlements(),public.list_unsettled_payroll_loads(),public.list_verified_driver_pay_rates() from authenticated;
drop function if exists public.list_verified_driver_settlements();drop function if exists public.list_unsettled_payroll_loads();drop function if exists public.list_verified_driver_pay_rates();
-- Payroll tables remain retained financial and audit history.
commit;
