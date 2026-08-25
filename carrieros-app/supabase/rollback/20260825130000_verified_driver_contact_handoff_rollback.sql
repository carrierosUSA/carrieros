-- Guarded rollback: removes contact-phone output while preserving all driver, assignment, and audit records.
begin;
revoke all on function public.list_assignable_company_drivers() from public, anon, authenticated;
drop function if exists public.list_assignable_company_drivers();
create function public.list_assignable_company_drivers()
returns table(user_id uuid, display_name text)
language sql stable security definer set search_path = public as $$
  select u.id, coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(concat_ws(' ', u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'last_name')), ''), 'Verified driver')
  from auth.users u join public.driver_profiles p on p.driver_user_id = u.id
  where public.current_business_role() in ('super_admin','owner','dispatcher')
    and p.company_id = public.document_intake_company_id()
    and u.raw_app_meta_data ->> 'company_id' = p.company_id::text
    and u.raw_app_meta_data ->> 'business_role' = 'driver'
    and p.status = 'active' and p.cdl_expires_on >= current_date and p.medical_card_expires_on >= current_date
  order by 2, 1
$$;
revoke all on function public.list_assignable_company_drivers() from public, anon;
grant execute on function public.list_assignable_company_drivers() to authenticated;
commit;
