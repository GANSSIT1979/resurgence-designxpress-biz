# Codebase Task Proposals (2026-04-20)

Updated: 2026-04-23

## Status

Historical planning or handoff note. Use README.md, docs/README.md, docs/ROADMAP.md, and the rollout checklists for the current system state.


This pass proposes one focused task in each requested category: typo, bug, documentation discrepancy, and test improvement.

## 1) Typo Fix Task

**Issue found**
- The admin settings form filename is spelled `setings-form.tsx` (missing a `t`), which is inconsistent with project naming patterns and reduces discoverability.

**Task**
- Rename `src/app/admin/settings/setings-form.tsx` to `src/app/admin/settings/settings-form.tsx` and update all imports.

**Why this matters**
- Improves maintainability and searchability (new contributors will look for `settings-form`).

**Acceptance criteria**
- No references to `setings-form` remain.
- Build/typecheck still pass after rename.

---

## 2) Bug Fix Task

**Issue found**
- `formatCurrency` in `src/lib/partner.ts` treats `0` as missing because it checks `if (!amount)`, returning `—` instead of `₱0`.

**Task**
- Update the null/undefined guard to allow zero values (for example: `if (amount == null)`).

**Why this matters**
- `0` is a valid monetary value and should render correctly in partner dashboards/reports.

**Acceptance criteria**
- `formatCurrency(0)` returns a currency string, not `—`.
- Existing null/undefined behavior remains unchanged.

---

## 3) Comment/Documentation Discrepancy Task

**Issue found**
- `docs/API.md` says `POST /api/chatkit/message` routes only to `sponsorships`, `events`, `custom-apparel`, and `partnerships`.
- Code currently supports six categories, including `orders` and `payments`.

**Task**
- Update `docs/API.md` support routing section so category documentation matches actual implementation in `src/lib/openai-support.ts`.

**Why this matters**
- Prevents stale API docs and incorrect assumptions during QA/handoffs.

**Acceptance criteria**
- Docs list all currently supported support routes.
- Documentation wording aligns with the keys in `SupportCategory`.

---

## 4) Test Improvement Task

**Issue found**
- The repo currently has no automated unit/integration test files for key business helpers (only utility scripts), which increases regression risk.

**Task**
- Add a minimal test setup and first unit test targeting `formatCurrency` in `src/lib/partner.ts` (cover `0`, positive, and `null`/`undefined`).

**Why this matters**
- Adds immediate regression coverage for a real bug-prone formatter and creates a test pattern for similar utilities.

**Acceptance criteria**
- A test command exists and runs in CI/local.
- Test covers at least: `0`, positive amount, and missing amount behaviors.
- Test passes.
