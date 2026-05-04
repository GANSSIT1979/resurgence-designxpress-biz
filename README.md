# RESURGENCE Sponsor Submit Compatibility Patch

This patch adds a compatibility route for sponsor application forms that submit as HTML form data, while preserving JSON API support.

## Files

- `src/app/api/sponsor/submit/route.ts`
- `src/app/sponsors/thank-you/page.tsx`

## Install

Copy the `src` folder into the root of `resurgence-designxpress-biz`, then run:

```bash
npm run build
git add src/app/api/sponsor/submit/route.ts src/app/sponsors/thank-you/page.tsx
git commit -m "Add sponsor submit compatibility route"
git push origin main
```

## Behavior

- Accepts `application/json`
- Accepts HTML form submissions via `request.formData()`
- Creates `SponsorSubmission`
- Triggers workflow notifications and automated emails
- Redirects successful form submissions to `/sponsors/thank-you?id=<submissionId>`

Source request: uploaded compatibility route instructions.
