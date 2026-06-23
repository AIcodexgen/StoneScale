-- Marble Measure & Invoice App — Phase 1 schema, RLS, and RPC
-- Source of truth: CLAUDE.md "Database fields". Do not add or rename fields.
-- Run this in the Supabase SQL editor (or via supabase db push).
--
-- NOTE ON next_invoice_number (deviation from the phase doc, flagged for review):
-- The phase's RLS says only admins may UPDATE stores, but staff must be able to
-- create invoices, and creating an invoice needs a number from
-- next_invoice_number() which bumps stores.invoice_counter. A plain
-- (security invoker) function would therefore be blocked for staff. We make the
-- function SECURITY DEFINER and guard it so a caller can only get a number for
-- their own store. This is the single controlled exception to the admin-only
-- stores update rule.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  logo_url text,
  currency_symbol text not null default 'Rs',
  invoice_prefix text not null default 'INV-',
  invoice_counter int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  category text,
  price_per_sqft numeric(10,2) not null check (price_per_sqft >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  invoice_number text not null,
  customer_name text,
  customer_phone text,
  subtotal numeric(12,2) not null,
  discount_type text check (discount_type in ('percent','flat')),
  discount_value numeric(10,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  product_name text not null,
  price_per_sqft numeric(10,2) not null,
  length numeric(10,2) not null,
  width numeric(10,2) not null,
  quantity int not null default 1 check (quantity > 0),
  sqft_per_piece numeric(12,2) not null,
  total_sqft numeric(12,2) not null,
  line_total numeric(12,2) not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper functions (SECURITY DEFINER so they can read profiles without
-- tripping the profiles RLS policy / recursing).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.app_store_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select store_id from public.profiles where id = auth.uid()
$$;

create or replace function public.app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table stores        enable row level security;
alter table profiles      enable row level security;
alter table products      enable row level security;
alter table invoices      enable row level security;
alter table invoice_items enable row level security;

-- stores: own store readable; only admin may update.
create policy stores_select on stores
  for select to authenticated
  using (id = app_store_id());

create policy stores_update on stores
  for update to authenticated
  using (id = app_store_id() and app_is_admin())
  with check (id = app_store_id() and app_is_admin());

-- profiles: members of the store may read profiles in their store.
create policy profiles_select on profiles
  for select to authenticated
  using (store_id = app_store_id());

-- products: staff read; only admin writes.
create policy products_select on products
  for select to authenticated
  using (store_id = app_store_id());

create policy products_insert on products
  for insert to authenticated
  with check (store_id = app_store_id() and app_is_admin());

create policy products_update on products
  for update to authenticated
  using (store_id = app_store_id() and app_is_admin())
  with check (store_id = app_store_id() and app_is_admin());

create policy products_delete on products
  for delete to authenticated
  using (store_id = app_store_id() and app_is_admin());

-- invoices: own store readable; staff and admin may create.
create policy invoices_select on invoices
  for select to authenticated
  using (store_id = app_store_id());

create policy invoices_insert on invoices
  for insert to authenticated
  with check (store_id = app_store_id());

-- invoice_items: scoped through the parent invoice's store.
create policy invoice_items_select on invoice_items
  for select to authenticated
  using (exists (
    select 1 from invoices i
    where i.id = invoice_items.invoice_id
      and i.store_id = app_store_id()
  ));

create policy invoice_items_insert on invoice_items
  for insert to authenticated
  with check (exists (
    select 1 from invoices i
    where i.id = invoice_items.invoice_id
      and i.store_id = app_store_id()
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- Invoice number RPC (SECURITY DEFINER — see note at top of file).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.next_invoice_number(p_store_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_counter int;
begin
  -- A caller may only draw a number for their own store.
  if p_store_id is distinct from public.app_store_id() then
    raise exception 'not authorized for store %', p_store_id;
  end if;

  update stores
    set invoice_counter = invoice_counter + 1
    where id = p_store_id
    returning invoice_prefix, invoice_counter into v_prefix, v_counter;

  return v_prefix || lpad(v_counter::text, 4, '0');
end;
$$;

grant execute on function public.app_store_id()            to authenticated;
grant execute on function public.app_is_admin()            to authenticated;
grant execute on function public.next_invoice_number(uuid) to authenticated;
