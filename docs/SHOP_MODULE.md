# SHOP MODULE

Updated: 2026-04-19

## Overview

The Resurgence shop is already built into this repository. It is not a separate starter package that needs to be imported into the current codebase.

The live commerce flow covers:

- storefront browsing on `/shop`
- product detail pages on `/shop/product/[slug]`
- cart management on `/cart`
- checkout on `/checkout`
- email-based order lookup on `/account/orders`
- admin product management on `/admin/products`
- admin order management on `/admin/orders`

## Current Entry Points

Pages:

- `src/app/shop/page.tsx`
- `src/app/shop/product/[slug]/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/orders/page.tsx`

Public route handlers:

- `src/app/api/shop/products/route.ts`
- `src/app/api/shop/products/[slug]/route.ts`
- `src/app/api/checkout/route.ts`

Admin route handlers:

- `src/app/api/admin/shop-products/route.ts`
- `src/app/api/admin/shop-products/[id]/route.ts`
- `src/app/api/admin/shop-orders/route.ts`
- `src/app/api/admin/shop-orders/[id]/route.ts`

## Components And Helpers

Reusable UI and domain logic live in:

- `src/components/shop/`
- `src/components/forms/shop-product-manager.tsx`
- `src/components/forms/shop-order-manager.tsx`
- `src/lib/shop.ts`
- `src/lib/shop/types.ts`

Important implementation note:

- the cart is client-side state stored in local storage under `resurgence_cart`
- there is no dedicated `/api/cart` route in the current app
- there is no `src/lib/shop/session.ts` in the live repo because checkout does not depend on a signed-in storefront account

## Access Model

Commerce access currently works like this:

- `/shop`, `/shop/product/[slug]`, `/cart`, and `/checkout` are public
- `/account/orders` is a public order lookup page that filters by checkout email
- `/admin/products` and `/admin/orders` are protected by admin middleware and the role permission matrix

This means the shop does not currently use a customer account login flow. Older wording that describes `/account/orders` as a signed-in account dashboard is not accurate for this repository.

## Checkout And Payment Behavior

The checkout module currently supports:

- `COD`
- `GCASH_MANUAL`
- `BANK_TRANSFER`

Current server behavior in `src/app/api/checkout/route.ts`:

- validates the checkout payload
- loads active products from Prisma
- rejects missing or out-of-stock items
- computes subtotal, shipping, and total
- creates a `ShopOrder` with `ShopOrderItem` records
- sets order status to `PENDING` for COD
- sets order status to `AWAITING_PAYMENT` for non-COD methods
- decrements stock transactionally after order creation

## Prisma Models

The active shop schema is already merged into `prisma/schema.prisma`.

Commerce models and enums currently include:

- `ShopCategory`
- `ShopProduct`
- `ShopOrder`
- `ShopOrderItem`
- `ShopOrderStatus`
- `ShopPaymentStatus`
- `ShopPaymentMethod`

Related files:

- active schema: `prisma/schema.prisma`
- sample shop seed: `prisma/seed-shop.ts`
- legacy reference patch: `prisma/shop-extension.prisma`

`prisma/shop-extension.prisma` is retained as a reference artifact. It is not a required merge step for this repository because the live schema already contains the commerce models.

## Stack Reality

The live shop uses the same stack as the rest of the application:

- Next.js App Router
- TypeScript
- Prisma ORM
- the existing Resurgence auth, middleware, and permission layer
- the current project styling system

Older starter text that assumes Tailwind-only integration or a separate auth adapter file does not reflect how this repository is currently wired.

## Environment And Configuration Notes

Relevant project configuration for the live repo includes:

- `DATABASE_URL`
- `PRISMA_DB_PROVIDER`
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Important accuracy notes:

- the current repository uses `JWT_SECRET`, not `AUTH_SECRET`
- the live checkout code does not currently read `GCASH_NUMBER`, `BANK_ACCOUNT_NAME`, `BANK_ACCOUNT_NUMBER`, or `BANK_NAME`
- business-level payment/contact information is configured through app settings and environment-backed defaults, not through dedicated checkout payment env vars

## Integration Guidance For Other Repositories

If you reuse this commerce module in another project, the adaptation work is mostly:

1. merge the commerce models into that project's Prisma schema
2. copy the shop pages, route handlers, components, and helpers
3. connect the Prisma import path if the destination project exposes Prisma differently
4. connect route protection for admin product and order management
5. decide whether to keep the current public email-based order lookup or replace it with a customer account model

That guidance applies to external reuse only. It is not a setup step for this repository because the shop is already integrated.
