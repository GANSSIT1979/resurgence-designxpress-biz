# CHANGELOG

## 2026-04-23

### Documentation Refresh

- refreshed the root `README.md` and canonical `docs/` overview pages to reflect the live route map
- documented the member dashboard, community feed, and free public signup flows more clearly
- updated architecture and API docs to include Gmail signup, mobile OTP signup, feed interactions, notifications, and current support routing categories
- refreshed the merch module guide to describe how shop flows now intersect with the member dashboard and creator-commerce feed
- expanded the user and admin guides so role expectations match the current product surface

## 2026-04-19

### Repository Health

- verified that `npx tsc --noEmit --pretty false` passes
- verified that `npm run build` passes
- verified that `npm run support:verify` passes against a running local app

### Documentation Alignment

- updated the root readmes and the `docs/` set to match the repaired codebase
- removed stale references to build blockers that no longer exist
- documented creator dashboard access for configured `CREATOR` role users
- corrected current script names, API paths, route redirects, and demo credentials

### Official Resurgence Merch

- upgraded the shop into the Official Resurgence Merch module
- added searchable storefront filters, premium product detail pages, selected size/color variants, and expanded checkout payment methods
- added merch metadata fields, merch image uploads, admin product management, admin order review, and seeded official merch products

### Support Documentation

- documented the current rule-based support flow and lead capture behavior
- documented webhook verification, local verifier behavior, and email automation caveats

## 2026-04-16

### Earlier Docs Pass

- standardized the documentation structure
- documented the support verifier and workflow environment variables
