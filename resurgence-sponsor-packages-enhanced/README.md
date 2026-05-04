# RESURGENCE Sponsor Packages Enhanced Verification Bundle

This bundle is for documenting and verifying the Sponsor Packages and Events routes.

## Important

The uploaded pasted files were rendered production HTML snapshots, not editable Next.js source files.

Do not replace:

- src/app/sponsors/page.tsx
- src/app/events/page.tsx
- src/app/layout.tsx
- src/app/globals.css

with rendered HTML.

## Verified routes

- /sponsors
- /events

## Public route replacements

Use these public routes instead of private Vercel dashboard/deployment URLs:

- /sponsors
- /sponsor/apply
- /events/dayo-series-ofw-all-star
- /events/dayo-series-ofw-all-star/apply
- /contact

## Apply

After copying this bundle into your repo:

npm run build
git add docs/live-snapshots docs/deployment
git commit -m "Add sponsor package route verification audit"
git push origin main
