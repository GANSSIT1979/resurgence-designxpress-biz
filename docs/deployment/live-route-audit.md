# RESURGENCE Live Route Verification Audit

This package stores rendered production HTML snapshots for live route verification. These files are deployment evidence only and must not replace React/Next.js source files.

## Verified snapshots

### `/shop/product/jake-anilao-creator-tee`

Verified from uploaded rendered HTML snapshot:

- Route resolves successfully.
- Product detail page renders the `merch-detail-page` layout.
- Product data is present for `Jake Anilao Creator Tee`.
- Product image, price, compare-at price, SKU, material, fit, stock, sizes, colors, and care instructions render.
- `MerchPurchasePanel` is present in the rendered React payload.
- `StickyMobileActionBar` is present in the rendered React payload.
- Header, footer, mobile bottom nav, SEO metadata, Open Graph metadata, and Twitter metadata are present.

### `/creators`

Verified from uploaded rendered HTML snapshot:

- Route resolves successfully.
- Creator directory hero renders.
- `CreatorDirectory` is present in the rendered React payload.
- Six active creator cards render.
- Creator search UI renders.
- Creator KPI cards show active channels, visible social reach, and connected social profiles.
- Creator profile links render for individual creator pages.
- Header, footer, mobile bottom nav, SEO metadata, Open Graph metadata, and Twitter metadata are present.

## Important source-code rule

Do not copy these HTML files into `src/app`. They are output from a deployed Next.js app, not source files.

Correct source locations remain:

- `src/app/shop/product/[slug]/page.tsx`
- `src/app/creators/page.tsx`
- `src/components/...`
- `src/lib/...`

## Recommended validation commands

Run from the repository root:

```bash
npm run build
npm run lint
```

If successful:

```bash
git status
git add docs/live-snapshots docs/deployment/live-route-audit.md docs/deployment/route-verification-checklist.md
git commit -m "Add enhanced live route verification snapshots"
git push origin main
```
