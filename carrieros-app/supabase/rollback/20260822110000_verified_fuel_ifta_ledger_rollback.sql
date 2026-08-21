-- Guarded rollback: disables future Fuel/IFTA writes and preserves every record and audit event.
begin;
revoke all on function public.void_verified_ifta_record(text,uuid,text,text)from authenticated;drop function if exists public.void_verified_ifta_record(text,uuid,text,text);
revoke all on function public.record_verified_ifta_mileage(uuid,date,text,integer,integer,text,uuid,text,text)from authenticated;drop function if exists public.record_verified_ifta_mileage(uuid,date,text,integer,integer,text,uuid,text,text);
revoke all on function public.record_verified_fuel_purchase(uuid,timestamptz,text,numeric,bigint,text,integer,text,uuid,text,text)from authenticated;drop function if exists public.record_verified_fuel_purchase(uuid,timestamptz,text,numeric,bigint,text,integer,text,uuid,text,text);
revoke all on function public.list_ifta_quarter_records(integer,integer),public.list_ifta_quarter_summary(integer,integer),public.list_verified_fuel_receipts(),public.list_ifta_trucks()from authenticated;drop function if exists public.list_ifta_quarter_records(integer,integer);drop function if exists public.list_ifta_quarter_summary(integer,integer);drop function if exists public.list_verified_fuel_receipts();drop function if exists public.list_ifta_trucks();
-- Fuel, mileage, void, and audit history remain retained.
commit;
