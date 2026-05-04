# Public Link Replacement Checklist

## Private link to remove from public UI

```txt
https://vercel.com/resurgence-designxpress-projects/resurgence-designxpress-biz/c/-dO62nuhDWNJ?s=1
```

## Replacement public routes

| Use case | Public route |
|---|---|
| Sponsor packages | `/sponsors` |
| Sponsor application | `/sponsor/apply` |
| Event catalog | `/events` |
| DAYO event landing | `/events/dayo-series-ofw-all-star` |
| DAYO sponsor application | `/events/dayo-series-ofw-all-star/apply` |
| Contact / proposal request | `/contact` |
| Admin events | `/admin/events` |
| Admin sponsor CRM | `/admin/sponsor-crm` |

## Search command

```bash
grep -R "vercel.com/resurgence-designxpress-projects/resurgence-designxpress-biz" -n . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```

## Rule

Private Vercel dashboard/deployment URLs are operational links. They must not be exposed as public CTAs, email links, landing page buttons, proposal links, or sponsor payment links.
