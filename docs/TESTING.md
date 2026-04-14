# TESTING

## Testing Strategy

This project benefits from three layers:

1. smoke testing
2. role workflow testing
3. regression testing after schema or UI refactors

## Local Smoke Tests

Verify these pages load:

- `/`
- `/about`
- `/services`
- `/sponsors`
- `/sponsor/apply`
- `/contact`
- `/support`
- `/login`

## Auth Tests

Verify login for:
- System Admin
- Cashier
- Sponsor
- Staff
- Partner

Expected:
- each role lands on the correct dashboard
- logout clears session cookie

## Admin Tests

Verify:
- admin overview loads
- sponsor applications list renders
- inquiries page renders
- gallery page renders
- CRUD surfaces load without missing delegate errors

## Cashier Tests

Verify:
- overview loads
- invoice page loads
- receipt page loads
- reports page loads
- values use schema-aligned fields such as `number` and `balanceDue`

## Sponsor Tests

Verify:
- sponsor overview loads for linked sponsor user
- applications page loads
- deliverables page loads
- billing page does not crash when invoice data is absent
- profile page loads and saves JSON safely

## Support Tests

If AI is disabled:
- support page still loads
- endpoint returns controlled disabled-state message

If AI is enabled:
- session endpoint works
- message endpoint saves messages
- lead capture flips `leadCaptured` when submitted

## Recommended Manual Regression Checklist

After any large patch:
- `npm run prisma:generate`
- restart dev server
- login and logout
- open each dashboard
- test sponsor apply form
- test contact form
- test support page
- test one CRUD page from admin and cashier

## Automated Testing Future Direction

Add:
- unit tests for auth helpers
- route tests for protected APIs
- integration tests for form workflows
- Playwright or Cypress for end-to-end dashboard flows
