-- Guarded rollback: disables future finance writes and preserves invoice/payment history.
begin;
revoke all on function public.record_verified_payment(uuid,bigint,timestamptz,text,text,text) from authenticated;
drop function if exists public.record_verified_payment(uuid,bigint,timestamptz,text,text,text);
revoke all on function public.record_verified_invoice(uuid,text,timestamptz,integer,text) from authenticated;
drop function if exists public.record_verified_invoice(uuid,text,timestamptz,integer,text);
revoke all on function public.list_finance_receivables() from authenticated;
drop function if exists public.list_finance_receivables();
-- Columns and payment rows remain as retained financial records.
commit;
