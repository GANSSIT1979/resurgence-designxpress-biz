# Sponsor Package Link Replacement Checklist

Replace any private Vercel dashboard or deployment links with public app routes.

## Do not use as public CTA

https://vercel.com/resurgence-designxpress-projects/resurgence-designxpress-biz/c/-dO62nuhDWNJ?s=1

## Use these instead

| Use case | Public route |
|---|---|
| Sponsor packages | /sponsors |
| Sponsor application | /sponsor/apply |
| Event landing | /events/dayo-series-ofw-all-star |
| Event sponsor application | /events/dayo-series-ofw-all-star/apply |
| Proposal request | /contact |

## Search before commit

Run:

grep -R "vercel.com/resurgence-designxpress-projects/resurgence-designxpress-biz" -n src app components lib docs . || true

If any result appears in user-facing source, replace it with the correct public route.
