# OFFICIAL RESURGENCE MERCH MODULE

Updated: 2026-04-23

## Overview

The Resurgence shop is the Official Resurgence Merch module already integrated into this repository. It powers public merch browsing, checkout, order lookup, and admin product/order operations from the same application that serves the community feed and role dashboards.

The live commerce flow covers:

- merch browsing on `/shop`
- product detail pages on `/shop/product/[slug]`
- cart management on `/cart`
- checkout on `/checkout`
- email-based order lookup on `/account/orders`
- member dashboard links and merch recommendations on `/member`
- merch-aware community feed product tags on `/feed`
- admin merch product management on `/admin/products`
- admin merch order management on `/admin/orders`

## Current Entry Points

Pages:

- `src/app/shop/page.tsx`
- `src/app/shop/product/[slug]/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/app/member/page.tsx`
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
- `src/components/image-upload-field.tsx`
- `src/lib/shop.ts`
- `src/lib/shop/types.ts`
- `src/lib/shop/cart-storage.ts`

Important implementation notes:

- the cart is client-side state stored in local storage under `resurgence_cart`
- there is no collection-level `/api/cart` route in the current app
- checkout does not depend on a signed-in storefront account
- the member dashboard improves discovery and access, but order ownership remains tied to checkout email

## Access Model

Commerce access currently works like this:

- `/shop`, `/shop/product/[slug]`, `/cart`, and `/checkout` are public
- `/account/orders` is a public order lookup page filtered by checkout email
- `/member` can deep-link a signed-in member into their email-based order lookup and merch highlights
- `/admin/products` and `/admin/orders` are protected by admin middleware and the role permission matrix

Important accuracy note:

- the presence of a member dashboard does not mean the merch module has become a full customer-account storefront with server-owned carts and account-native order history

## Checkout And Payment Behavior

The checkout module currently supports:

- `COD`
- `GCASH_MANUAL`
- `MAYA_MANUAL`
- `BANK_TRANSFER`
- `CARD_MANUAL`
- `CASH`

Current server behavior in `src/app/api/checkout/route.ts`:

- validates the checkout payload
- loads active products from Prisma
- rejects missing or out-of-stock items
- computes subtotal, shipping, and total
- creates a `ShopOrder` with `ShopOrderItem` records, including selected variant labels such as size and color
- sets order status to `PENDING` for COD
- sets order status to `AWAITING_PAYMENT` for non-COD methods
- decrements stock transactionally after order creation

## Merch Product Fields

`ShopProduct` supports standard commerce fields plus official merch metadata:

- `badgeLabel`
- `material`
- `fitNotes`
- `careInstructions`
- `availableSizes`
- `availableColors`
- `isOfficialMerch`

`ShopOrderItem` stores `variantLabel` so fulfillment can see selections such as `Size: L / Color: Black`.

## Community Feed Integration

The merch module is also connected to the creator-commerce feed:

- posts can carry merch product tags
- promoted placements can point users into merch detail pages
- the member dashboard can surface recommended featured products alongside feed activity

This means commerce is not isolated to the shop route alone; it is also discoverable through community and dashboard experiences.

## Admin Uploads

System Admin users can upload merch images through the product manager. Uploads use the `merch` scope and are stored under:

- local development: `public/uploads/merch`
- database-backed production modes: `UploadAsset` records served through `/api/uploads/image/[id]`
- object-storage-backed delivery: `/api/uploads/r2/[...key]` with public base URL support when configured

## Prisma Models

The active shop schema is already merged into `prisma/schema.prisma`.

Commerce models and enums include:

- `ShopCategory`
- `ShopProduct`
- `ShopOrder`
- `ShopOrderItem`
- `ShopOrderStatus`
- `ShopPaymentStatus`
- `ShopPaymentMethod`

Related files:

- active schema: `prisma/schema.prisma`
- generated schema: `prisma/schema.generated.prisma`
- active seed: `prisma/seed.ts`

## Environment And Configuration Notes

Relevant project configuration includes:

- `DATABASE_URL`
- `PRISMA_DB_PROVIDER`
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `GCASH_NUMBER`
- `MAYA_NUMBER`
- `BANK_ACCOUNT_NAME`
- `BANK_ACCOUNT_NUMBER`
- `BANK_NAME`

Accuracy notes:

- the current repository uses `JWT_SECRET`, not `AUTH_SECRET`
- business payment/contact details are resolved through app settings and environment-backed defaults
- the provider-selection step is handled before Prisma commands by `scripts/prepare-prisma-schema.mjs`
