# Feed Upgrade Phase 10: Shop Integration

Updated: 2026-04-19

## Objective

Connect the creator-commerce feed to the existing Official Resurgence Merch cart and checkout flow without introducing a separate commerce system.

## Files Created Or Updated

- `src/lib/shop/cart-storage.ts`
- `src/components/feed/creator-commerce-feed.tsx`
- `src/components/shop/add-to-cart-button.tsx`
- `src/components/shop/cart-client.tsx`
- `src/components/shop/checkout-client.tsx`
- `src/app/globals.css`
- `docs/README.md`
- `docs/FEED_UPGRADE_PHASE_10.md`

## Prisma Changes

No Prisma schema changes are included in this phase.

This phase reuses:

- `ShopProduct`
- `PostProductTag`
- Existing checkout validation
- Existing stock validation
- Existing `ShopOrder` creation flow

## Implementation Notes

- Adds a shared client-side cart storage helper for the existing `resurgence_cart` localStorage contract.
- Reuses the same cart item shape already consumed by cart and checkout pages.
- Updates the feed merch shelf to support both product detail navigation and add-to-cart actions.
- Adds feed cart count, View Cart, and Checkout CTAs.
- Keeps checkout as the source of truth for final stock validation and order creation.
- Keeps all payments and order fulfillment behavior unchanged.

## User-Facing Behavior

- Feed product tags show product name, price, stock label, View button, and Add button.
- Sold-out tagged products show a disabled sold-out state.
- Adding from the feed updates the same cart used by `/cart` and `/checkout`.
- The feed right rail displays the current cart item count.
- Cart and checkout still read from the same localStorage key and submit the same checkout payload.

## Risk Checks

- No checkout API change.
- No order schema change.
- No payment method change.
- No stock decrement change.
- No product source-of-truth change.
- Feed add-to-cart remains client-side, while checkout still validates stock server-side.

## Done Criteria

- Feed product tags can add active merch to cart.
- Feed product tags link to product detail pages when slugs exist.
- `/cart` sees feed-added products.
- `/checkout` submits feed-added products through the existing checkout route.
- Sold-out products cannot be added from the feed.
- Build passes.
- The change can be reverted independently from analytics or tracking chunks.
