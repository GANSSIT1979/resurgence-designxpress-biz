# Creator Dashboard UI + Admin Payout Panel

## Included

- Web creator earnings dashboard
- Recharts-based earnings/funnel charts
- Creator payout request form
- Admin payout approval table
- Mobile earnings screen
- Mobile earnings API client

## Web Routes

- `/creator/earnings?creatorProfileId=...`
- `/admin/payouts`

## Required APIs

- `GET /api/creator/earnings?creatorProfileId=...`
- `POST /api/creator/payouts/request`
- `GET /api/admin/payouts`
- `POST /api/admin/payouts/approve`
- `POST /api/admin/payouts/mark-paid`

## Dependency

The web charts require `recharts`, which is already present in the project dependencies.

## Security

Before production exposure:

- Replace query-string `creatorProfileId` with authenticated creator identity.
- Protect `/admin/payouts` with SYSTEM_ADMIN/CASHIER RBAC.
- Validate payout amounts server-side.
- Do not mark payouts paid without reference number/audit logs.

## Mobile Note

Replace `REPLACE_WITH_AUTH_CREATOR_PROFILE_ID` with the authenticated creator profile ID once mobile auth profile hydration is finalized.
