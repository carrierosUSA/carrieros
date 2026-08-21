-- Human-verified company profile and owner-only same-company team directory.
-- Review before applying. This file does not run against an environment by itself.
begin;
create table public.carrier_company_profiles(
  company_id uuid primary key,legal_name text not null check(char_length(legal_name) between 2 and 200),
  dba_name text check(dba_name is null or char_length(dba_name) between 2 and 200),
  usdot_number text check(usdot_number is null or usdot_number~'^[0-9]{5,8}$'),
  mc_number text check(mc_number is null or mc_number~'^[0-9]{5,8}$'),
  contact_email text check(contact_email is null or char_length(contact_email) between 3 and 254),
  contact_phone text check(contact_phone is null or char_length(contact_phone) between 7 and 30),
  timezone text not null default 'America/Chicago' check(timezone in ('America/New_York','America/Chicago','America/Denver','America/Los_Angeles','UTC')),
  currency text not null default 'USD' check(currency='USD'),country_code text not null default 'US' check(country_code='US'),
  ai_partner_name text not null default 'Nova' check(ai_partner_name~'^[A-Za-z][A-Za-z0-9 ._-]{1,39}$'),
  verified_by uuid not null,verified_at timestamptz not null default now(),created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.carrier_company_profile_events(
  id uuid primary key default gen_random_uuid(),company_id uuid not null,event_type text not null check(event_type in('created','updated')),
  before_state jsonb,after_state jsonb not null,factual_note text,actor_user_id uuid not null,request_id text not null,created_at timestamptz not null default now(),
  unique(company_id,id),unique(company_id,request_id),constraint company_profile_events_company_fk foreign key(company_id)references public.carrier_company_profiles(company_id)
);
alter table public.carrier_company_profiles enable row level security;alter table public.carrier_company_profile_events enable row level security;
create policy company_profile_same_company_select on public.carrier_company_profiles for select using(company_id=public.document_intake_company_id());
create policy company_profile_events_owner_select on public.carrier_company_profile_events for select using(company_id=public.document_intake_company_id() and public.current_business_role() in('super_admin','owner'));
revoke all privileges on table public.carrier_company_profiles,public.carrier_company_profile_events from public,anon,authenticated,service_role;
grant select on table public.carrier_company_profiles,public.carrier_company_profile_events to authenticated,service_role;
grant insert,update on table public.carrier_company_profiles to service_role;grant insert on table public.carrier_company_profile_events to service_role;

create or replace function public.get_verified_company_profile()
returns table(company_id uuid,legal_name text,dba_name text,usdot_number text,mc_number text,contact_email text,contact_phone text,timezone text,currency text,country_code text,ai_partner_name text,verified_at timestamptz)
language sql stable security definer set search_path=public as $$select p.company_id,p.legal_name,p.dba_name,p.usdot_number,p.mc_number,p.contact_email,p.contact_phone,p.timezone,p.currency,p.country_code,p.ai_partner_name,p.verified_at from public.carrier_company_profiles p where p.company_id=public.document_intake_company_id() and public.current_business_role() is not null$$;

create or replace function public.list_verified_company_team()
returns table(user_id uuid,display_name text,email text,business_role text,joined_at timestamptz,last_sign_in_at timestamptz)
language sql stable security definer set search_path=public as $$select u.id,coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),nullif(trim(u.email),''),'Verified user'),u.email,u.raw_app_meta_data->>'business_role',u.created_at,u.last_sign_in_at from auth.users u where public.current_business_role() in('super_admin','owner') and u.raw_app_meta_data->>'company_id'=public.document_intake_company_id()::text order by 2,u.id$$;

create or replace function public.save_verified_company_profile(p_legal_name text,p_dba_name text,p_usdot_number text,p_mc_number text,p_contact_email text,p_contact_phone text,p_timezone text,p_ai_partner_name text,p_note text,p_request_id text)returns uuid
language plpgsql security definer set search_path=public as $$
declare v_company uuid:=public.document_intake_company_id();v_user uuid:=auth.uid();v_role text:=public.current_business_role();v_before jsonb;v_after jsonb;v_exists boolean;
begin
 if v_company is null or v_user is null or v_role not in('super_admin','owner')then raise exception 'Not authorized to manage company settings';end if;
 if p_request_id is null or char_length(p_request_id)not between 8 and 200 then raise exception 'Invalid request identifier';end if;
 if p_legal_name is null or char_length(trim(p_legal_name))not between 2 and 200 then raise exception 'Verified legal name required';end if;
 if p_dba_name is not null and char_length(trim(p_dba_name))not between 2 and 200 then raise exception 'Invalid DBA';end if;
 if p_usdot_number is not null and trim(p_usdot_number)!~'^[0-9]{5,8}$' then raise exception 'Invalid USDOT number';end if;
 if p_mc_number is not null and trim(p_mc_number)!~'^[0-9]{5,8}$' then raise exception 'Invalid MC number';end if;
 if p_contact_email is not null and (char_length(trim(p_contact_email))not between 3 and 254 or trim(p_contact_email)!~*'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')then raise exception 'Invalid contact email';end if;
 if p_contact_phone is not null and char_length(trim(p_contact_phone))not between 7 and 30 then raise exception 'Invalid contact phone';end if;
 if p_timezone not in('America/New_York','America/Chicago','America/Denver','America/Los_Angeles','UTC')then raise exception 'Invalid timezone';end if;
 if p_ai_partner_name is null or trim(p_ai_partner_name)!~'^[A-Za-z][A-Za-z0-9 ._-]{1,39}$'then raise exception 'Invalid AI partner name';end if;
 if p_note is not null and char_length(trim(p_note))not between 1 and 2000 then raise exception 'Invalid factual note';end if;
 if exists(select 1 from public.carrier_company_profile_events e where e.company_id=v_company and e.request_id=p_request_id)then return v_company;end if;
 select to_jsonb(p),true into v_before,v_exists from public.carrier_company_profiles p where p.company_id=v_company for update;
 insert into public.carrier_company_profiles(company_id,legal_name,dba_name,usdot_number,mc_number,contact_email,contact_phone,timezone,ai_partner_name,verified_by)
 values(v_company,trim(p_legal_name),nullif(trim(p_dba_name),''),nullif(trim(p_usdot_number),''),nullif(trim(p_mc_number),''),nullif(lower(trim(p_contact_email)),''),nullif(trim(p_contact_phone),''),p_timezone,trim(p_ai_partner_name),v_user)
 on conflict(company_id)do update set legal_name=excluded.legal_name,dba_name=excluded.dba_name,usdot_number=excluded.usdot_number,mc_number=excluded.mc_number,contact_email=excluded.contact_email,contact_phone=excluded.contact_phone,timezone=excluded.timezone,ai_partner_name=excluded.ai_partner_name,verified_by=v_user,verified_at=now(),updated_at=now();
 select to_jsonb(p)into v_after from public.carrier_company_profiles p where p.company_id=v_company;
 insert into public.carrier_company_profile_events(company_id,event_type,before_state,after_state,factual_note,actor_user_id,request_id)values(v_company,case when coalesce(v_exists,false)then'updated'else'created'end,v_before,v_after,nullif(trim(p_note),''),v_user,p_request_id);return v_company;
end$$;
revoke all on function public.get_verified_company_profile(),public.list_verified_company_team()from public,anon;
revoke all on function public.save_verified_company_profile(text,text,text,text,text,text,text,text,text,text)from public,anon;
grant execute on function public.get_verified_company_profile(),public.list_verified_company_team()to authenticated;
grant execute on function public.save_verified_company_profile(text,text,text,text,text,text,text,text,text,text)to authenticated;
commit;
