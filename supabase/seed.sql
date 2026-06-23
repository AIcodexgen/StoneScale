-- Marble Measure & Invoice App — Phase 1 seed data
-- Run AFTER schema.sql, and AFTER creating the owner auth user.
--
-- Steps:
--   1. Supabase Dashboard → Authentication → Users → "Add user" (email + password).
--      This is the store owner / admin.
--   2. Copy that user's UID and paste it in place of OWNER_AUTH_USER_ID below.
--   3. Run this file in the SQL editor.
--
-- Adjust the store details and product names/prices to the real store.

with new_store as (
  insert into stores (name, address, phone, currency_symbol, invoice_prefix)
  values ('Marble Store', '123 Main Road', '9000000000', 'Rs', 'INV-')
  returning id
),
new_profile as (
  insert into profiles (id, store_id, full_name, role)
  select 'OWNER_AUTH_USER_ID'::uuid, id, 'Store Owner', 'admin'
  from new_store
  returning store_id
)
insert into products (store_id, name, category, price_per_sqft)
select s.id, p.name, p.category, p.price
from new_store s
cross join (values
  ('Italian Marble', 'Premium', 250.00),
  ('Granite Black',  'Granite', 120.00),
  ('Onyx White',     'Premium', 450.00)
) as p(name, category, price);
