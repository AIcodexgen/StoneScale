# CLAUDE.md — Marble Measure & Invoice App

You are building a commercial Android + iOS app for a marble store. Read this file fully before any work in every session. Follow it exactly.

## Golden rules (do not break these)

1. **Work one phase at a time.** I will point you at a single file in `build-plan/`. Build only that phase. If a phase seems to need something from a later phase, stop and ask.
2. **The database schema is law.** Use only the fields defined below and in `/src/lib/types.ts`. Never invent a column or a field. If you think a new field is needed, stop and ask me first.
3. **Do not guess APIs.** If unsure about an Expo or Supabase function, check the official docs. Do not invent function names, parameters, or imports.
4. **No new libraries and no version changes** without my approval. Versions are pinned in `package.json`. Do not upgrade them.
5. **Small, focused diffs.** Change only what the current phase needs. Explain what you changed. No large unexplained rewrites.
6. **Ask before assuming.** If a requirement is unclear, ask one question instead of guessing.
7. **TypeScript strict mode stays on.** Do not weaken types or use `any` to silence errors.

## What the app does

- Staff pick a marble product, enter length and width in feet and a quantity.
- The app calculates square feet and the line amount, builds a cart, and generates an invoice with no GST or tax and an optional discount.
- The owner (admin role) can add products and change prices; changes sync to all devices.
- Invoices are saved and generated as PDFs on the device for sharing or printing.

## Stack (do not change)

- React Native + Expo, Expo Router, TypeScript strict.
- Supabase for Postgres, Auth, and Storage.
- TanStack Query (React Query) for server state and caching.
- Zustand for the in-progress cart.
- expo-print and expo-sharing for the PDF.

## Calculation rules (these are exact)

Length and width are in feet. No GST or tax.

```
sqFtPerPiece   = length * width
totalSqFt      = sqFtPerPiece * quantity
lineTotal      = totalSqFt * pricePerSqFt
subtotal       = sum of all lineTotal
discountAmount = percent ? subtotal * value / 100 : value   // clamp so it never exceeds subtotal
total          = subtotal - discountAmount
```

Currency rounds to 2 decimals, round half up. Sq ft shows 2 decimals. Implement as pure functions in `/src/lib/calc.ts` with unit tests. These must pass:

- 250/sqft, 8 x 4 ft, qty 3 -> 96 sq ft, 24,000
- 120/sqft, 2 x 2 ft, qty 10 -> 40 sq ft, 4,800
- Subtotal of both -> 28,800
- 10% discount on 28,800 -> 2,880 off, total 25,920
- Flat 2,000 on 28,800 -> total 26,800

## Database fields (source of truth)

- **stores**: id, name, address, phone, logo_url, currency_symbol, invoice_prefix, invoice_counter, created_at
- **profiles**: id, store_id, full_name, role ('admin' | 'staff'), created_at
- **products**: id, store_id, name, category, price_per_sqft, is_active, created_at, updated_at
- **invoices**: id, store_id, invoice_number, customer_name, customer_phone, subtotal, discount_type ('percent' | 'flat'), discount_value, discount_amount, total, notes, created_at
- **invoice_items**: id, invoice_id, product_name, price_per_sqft, length, width, quantity, sqft_per_piece, total_sqft, line_total

`invoice_items` stores snapshots. Editing a product later must never change a saved invoice. Invoice numbers come from the `next_invoice_number(store_id)` RPC. Do not generate numbers in the app.

## Security (hard rules)

- Use the Supabase **anon key** in the app, from env vars. **Never** put the service role key in the app or in any client file or repo.
- Every table uses Row Level Security: a store only accesses its own rows.
- Only `admin` may write products or update the store. `staff` may read products and create invoices. Enforce this in the UI as well.
- Do not hardcode the Supabase URL or keys in source; use `EXPO_PUBLIC_` env vars.

## Folder structure (keep to this)

```
/app: _layout.tsx, (auth)/login.tsx, (tabs)/index.tsx, (tabs)/history.tsx,
      (tabs)/settings.tsx, add-item.tsx, invoice/[id].tsx
/src: lib/supabase.ts, lib/types.ts, lib/calc.ts, store/cartStore.ts,
      queries/products.ts, queries/invoices.ts, queries/store.ts,
      components/, utils/currency.ts, utils/invoiceHtml.ts
```

## End of every phase

1. Run the app and confirm the phase's acceptance criteria.
2. Make sure TypeScript compiles with no errors and any tests pass.
3. Only then commit with a clear message naming the phase. Do not start the next phase until I say so.
