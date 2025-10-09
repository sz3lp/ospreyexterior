-- enable uuid generation
create extension if not exists pgcrypto;

-- enums
create type post_status as enum ('draft','published');

-- tables
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  zip_codes text[] not null,
  avg_rebate numeric(10,2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  city uuid not null references public.cities(id) on delete cascade,
  post_type text not null,
  url_slug text not null unique,
  keyword text,
  status post_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  city uuid references public.cities(id) on delete set null,
  service_type text not null,
  rainwise_interest boolean not null default false,
  source_channel text not null,
  created_at timestamptz not null default now()
);

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  impressions integer not null default 0,
  clicks integer not null default 0,
  calls integer not null default 0,
  form_submits integer not null default 0,
  date date not null
);

-- indexes
create index on public.posts (city, status);
create index on public.leads (service_type, created_at);
create index on public.leads (source_channel, created_at);
create index on public.analytics (post_id, date);
create index on public.cities using gin (zip_codes);

-- triggers to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- rls
alter table public.leads enable row level security;
alter table public.posts enable row level security;
alter table public.cities enable row level security;
alter table public.forms enable row level security;
alter table public.analytics enable row level security;

-- policies
-- leads: allow anon insert, authenticated select own inserts by email match header (optional) and service role full
create policy leads_insert_anon on public.leads
for insert to anon
with check (true);

create policy leads_select_auth on public.leads
for select to authenticated
using (true);

-- posts: read for all, write for service role only
create policy posts_select_all on public.posts
for select to anon, authenticated
using (true);

-- cities: read for all
create policy cities_select_all on public.cities
for select to anon, authenticated
using (true);

-- forms: insert by anon for public lead capture
create policy forms_insert_anon on public.forms
for insert to anon
with check (true);

-- analytics: read for authenticated
create policy analytics_select_auth on public.analytics
for select to authenticated
using (true);
