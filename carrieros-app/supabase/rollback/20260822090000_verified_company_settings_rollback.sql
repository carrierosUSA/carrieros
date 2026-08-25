-- Guarded rollback: disables future company-setting writes and preserves profile and audit history.
begin;
revoke all on function public.save_verified_company_profile(text,text,text,text,text,text,text,text,text,text)from authenticated;drop function if exists public.save_verified_company_profile(text,text,text,text,text,text,text,text,text,text);
revoke all on function public.list_verified_company_team(),public.get_verified_company_profile()from authenticated;drop function if exists public.list_verified_company_team();drop function if exists public.get_verified_company_profile();
-- Company profile and append-only events remain retained records.
commit;
