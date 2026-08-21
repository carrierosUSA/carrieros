-- Database-level gate for pending-to-dispatched release.
-- Review before applying. This file does not run against an environment by itself.
begin;

create or replace function public.enforce_verified_dispatch_release()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'pending' and new.status = 'dispatched' then
    if not exists (
      select 1
      from public.load_assignments a
      join auth.users u on u.id = a.driver_user_id
      where a.company_id = new.company_id
        and a.load_id = new.id
        and a.ended_at is null
        and a.equipment_fit_verified is true
        and a.hos_verified is true
        and a.safety_verified is true
        and char_length(trim(a.truck_unit)) between 1 and 80
        and u.raw_app_meta_data ->> 'company_id' = new.company_id::text
        and u.raw_app_meta_data ->> 'business_role' = 'driver'
    ) then
      raise exception 'Dispatch release requires an active verified same-company driver and all safety confirmations';
    end if;
  end if;
  return new;
end
$$;

drop trigger if exists loads_verified_dispatch_release on public.loads;
create trigger loads_verified_dispatch_release
before update of status on public.loads
for each row execute function public.enforce_verified_dispatch_release();

revoke all on function public.enforce_verified_dispatch_release() from public, anon, authenticated;

commit;
