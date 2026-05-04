# RESURGENCE Components Update Batch 2

This package contains uploaded React/Next.js UI components for admin moderation, creator earnings, creator-commerce feed, CMS managers, gallery manager, creator profile manager, and inquiry form.

## Included files

- src/components/admin/feed-moderation-manager.tsx
- src/components/admin/admin-reports-manager.tsx
- src/components/admin/content-manager.tsx
- src/components/admin/gallery-event-manager.tsx
- src/components/admin/creator-profile-manager.tsx
- src/components/creator/earnings/EarningsCards.tsx
- src/components/creator/earnings/EarningsCharts.tsx
- src/components/creator/earnings/PayoutRequestForm.tsx
- src/components/feed/creator-commerce-feed.tsx
- src/components/inquiry-form.tsx

## Apply

Copy this package content into the repo root, then run:

```bash
npm run build
```

If build succeeds:

```bash
git add src/components/admin/feed-moderation-manager.tsx src/components/admin/admin-reports-manager.tsx src/components/admin/content-manager.tsx src/components/admin/gallery-event-manager.tsx src/components/admin/creator-profile-manager.tsx src/components/creator/earnings/EarningsCards.tsx src/components/creator/earnings/EarningsCharts.tsx src/components/creator/earnings/PayoutRequestForm.tsx src/components/feed/creator-commerce-feed.tsx src/components/inquiry-form.tsx
git commit -m "Update admin creator feed and earnings components"
git push origin main
```

## Notes

Some files depend on existing project modules/components such as:

- @/components/resurgence/*
- @/components/image-upload-field
- @/components/filter-chip-row
- @/components/metric-bar-chart
- @/components/kpi-stat-card
- @/lib/feed/*
- @/lib/shop/cart-storage
- recharts

If build reports missing imports, add those modules before deployment.
