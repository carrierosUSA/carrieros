-- Human-verified broker directory. No authority, credit, or payment fact is inferred.
-- Review before applying. This file does not run against an environment by itself.
begin;
create table public.broker_profiles(
 id uuid primary key default gen_random_uuid(),company_id uuid not null,legal_name text not null check(char_length(legal_name)between 2 and 200),
 mc_number text not null check(mc_number~'^[0-9]{5,8}$'),contact_name text,contact_email text,contact_phone text,
 payment_terms_days integer not null default 30 check(payment_terms_days between 0 and 120),
 relationship_status text not null default 'review_required' check(relationship_status in('active','review_required','do_not_use')),
 factual_note text not null check(char_length(factual_note)between 3 and 2000),verified_by uuid not null,verified_at timestamptz not null default now(),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(company_id,id),unique(company_id,mc_number),
 check(contact_email is null or(char_length(contact_email)between 3 and 254 and contact_email~*'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
 check(contact_phone is null or char_length(contact_phone)between 7 and 30),check(contact_name is null or char_length(contact_name)between 2 and 120)
);
create table public.broker_profile_events(
 id uuid primary key default gen_random_uuid(),company_id uuid not null,broker_profile_id uuid not null,event_type text not null check(event_type in('created','updated')),
 before_state jsonb,after_state jsonb not null,factual_note text not null,actor_user_id uuid not null,request_id text not null,created_at timestamptz not null default now(),
 unique(company_id,request_id),constraint broker_event_profile_fk foreign key(company_id,broker_profile_id)references public.broker_profiles(company_id,id)
);
alter table public.broker_profiles enable row level security;alter table public.broker_profile_events enable row level security;
create policy broker_profiles_role_select on public.broker_profiles for select using(company_id=public.document_intake_company_id()and public.current_business_role()in('super_admin','owner','dispatcher','accounting','safety','read_only'));
create policy broker_events_role_select on public.broker_profile_events for select using(company_id=public.document_intake_company_id()and public.current_business_role()in('super_admin','owner','dispatcher','accounting'));
revoke all privileges on table public.broker_profiles,public.broker_profile_events from public,anon,authenticated,service_role;
grant select on table public.broker_profiles,public.broker_profile_events to authenticated,service_role;grant insert,update on table public.broker_profiles to service_role;grant insert on table public.broker_profile_events to service_role;
create or replace function public.list_verified_broker_profiles()returns table(id uuid,legal_name text,mc_number text,contact_name text,contact_email text,contact_phone text,payment_terms_days integer,relationship_status text,factual_note text,verified_at timestamptz)
language sql stable security definer set search_path=public as $$select b.id,b.legal_name,b.mc_number,b.contact_name,b.contact_email,b.contact_phone,b.payment_terms_days,b.relationship_status,b.factual_note,b.verified_at from public.broker_profiles b where b.company_id=public.document_intake_company_id()and public.current_business_role()in('super_admin','owner','dispatcher','accounting','safety','read_only')order by b.legal_name,b.id$$;
create or replace function public.save_verified_broker_profile(p_broker_id uuid,p_legal_name text,p_mc_number text,p_contact_name text,p_contact_email text,p_contact_phone text,p_payment_terms_days integer,p_relationship_status text,p_note text,p_request_id text)returns uuid
language plpgsql security definer set search_path=public as $$
declare v_company uuid:=public.document_intake_company_id();v_user uuid:=auth.uid();v_role text:=public.current_business_role();v_id uuid;v_before jsonb;v_after jsonb;v_event text;
begin
 if v_company is null or v_user is null or v_role not in('super_admin','owner','dispatcher','accounting')then raise exception 'Not authorized to manage broker records';end if;
 if p_request_id is null or char_length(p_request_id)not between 8 and 200 then raise exception 'Invalid request identifier';end if;
 select e.broker_profile_id into v_id from public.broker_profile_events e where e.company_id=v_company and e.request_id=p_request_id;if v_id is not null then return v_id;end if;
 if p_legal_name is null or char_length(trim(p_legal_name))not between 2 and 200 or p_mc_number is null or trim(p_mc_number)!~'^[0-9]{5,8}$'then raise exception 'Verified legal name and MC number required';end if;
 if p_contact_name is not null and char_length(trim(p_contact_name))not between 2 and 120 then raise exception 'Invalid contact name';end if;
 if p_contact_email is not null and(char_length(trim(p_contact_email))not between 3 and 254 or trim(p_contact_email)!~*'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')then raise exception 'Invalid contact email';end if;
 if p_contact_phone is not null and char_length(trim(p_contact_phone))not between 7 and 30 then raise exception 'Invalid contact phone';end if;
 if p_payment_terms_days not between 0 and 120 or p_relationship_status not in('active','review_required','do_not_use')or p_note is null or char_length(trim(p_note))not between 3 and 2000 then raise exception 'Invalid verified broker fields';end if;
 if p_broker_id is null then v_id:=gen_random_uuid();v_event:='created';else v_id:=p_broker_id;v_event:='updated';select to_jsonb(b)into v_before from public.broker_profiles b where b.id=v_id and b.company_id=v_company for update;if v_before is null then raise exception 'Same-company broker not found';end if;end if;
 insert into public.broker_profiles(id,company_id,legal_name,mc_number,contact_name,contact_email,contact_phone,payment_terms_days,relationship_status,factual_note,verified_by)
 values(v_id,v_company,trim(p_legal_name),trim(p_mc_number),nullif(trim(p_contact_name),''),nullif(lower(trim(p_contact_email)),''),nullif(trim(p_contact_phone),''),p_payment_terms_days,p_relationship_status,trim(p_note),v_user)
 on conflict(id)do update set legal_name=excluded.legal_name,mc_number=excluded.mc_number,contact_name=excluded.contact_name,contact_email=excluded.contact_email,contact_phone=excluded.contact_phone,payment_terms_days=excluded.payment_terms_days,relationship_status=excluded.relationship_status,factual_note=excluded.factual_note,verified_by=v_user,verified_at=now(),updated_at=now();
 select to_jsonb(b)into v_after from public.broker_profiles b where b.id=v_id and b.company_id=v_company;
 insert into public.broker_profile_events(company_id,broker_profile_id,event_type,before_state,after_state,factual_note,actor_user_id,request_id)values(v_company,v_id,v_event,v_before,v_after,trim(p_note),v_user,p_request_id);return v_id;
end$$;
revoke all on function public.list_verified_broker_profiles(),public.save_verified_broker_profile(uuid,text,text,text,text,text,integer,text,text,text)from public,anon;
grant execute on function public.list_verified_broker_profiles(),public.save_verified_broker_profile(uuid,text,text,text,text,text,integer,text,text,text)to authenticated;
commit;
