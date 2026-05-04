# RESURGENCE Route Files Patch

Included files:

- `src/app/login/page.tsx` from the uploaded production login gateway.
- `src/app/events/[slug]/page.tsx` updated with schedule fallback support:
  - `getEventScheduleLabel(event)`
  - filters blank highlights
  - renders optional multi-date `event.schedule` cards

Copy these files into the same paths in your repository, then run:

```bash
npm run build
```

If build fails, confirm these dependencies exist:

- `@/components/filter-chip-row`
- `@/components/profile-completion-meter`
- `@/lib/signup-roles`
- `@/lib/sponsorship-events` exports `getEventScheduleLabel`
