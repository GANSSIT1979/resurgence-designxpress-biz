# Admin Documentation

Admin surfaces control billing, revenue, sponsorships, and operational workflows.

## Core admin routes

| Route | Purpose |
|---|---|
| `/admin` | Admin overview |
| `/admin/invoices` | Invoice list, totals, customer, and status |
| `/admin/revenue` | Revenue analytics and funnel metrics |

## Invoice dashboard

- View invoices by status (DRAFT, SENT, PAID)
- Track outstanding balances
- Monitor recent payments

## Revenue dashboard

- Paid revenue
- Outstanding revenue
- Invoice conversion rate
- Sponsor funnel conversion
- Unpaid invoice alerts

## Operational rules

- Restrict admin routes to authorized roles only
- Do not expose billing data publicly
- Manual payment updates should be auditable
- Sponsor approvals should follow verified payment or reviewed reference

## Future improvements

- audit logs
- payment reminders
- invoice PDF generation
- deeper revenue analytics
