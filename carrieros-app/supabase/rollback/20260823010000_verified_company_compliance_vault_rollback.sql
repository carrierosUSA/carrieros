-- Disables future compliance-vault operations without deleting compliance history.
begin;
revoke execute on function public.list_approved_compliance_documents(),public.list_verified_company_compliance(),public.save_verified_company_compliance(uuid,uuid,text,text,text,date,date,text,text),public.void_verified_company_compliance(uuid,text,text) from authenticated;
drop function if exists public.list_approved_compliance_documents();drop function if exists public.list_verified_company_compliance();drop function if exists public.save_verified_company_compliance(uuid,uuid,text,text,text,date,date,text,text);drop function if exists public.void_verified_company_compliance(uuid,text,text);
commit;
