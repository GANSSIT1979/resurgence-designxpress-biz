# PRISMA ContentPost Comment Schema Integration

Updated: 2026-04-23

## Goal

Standardize the `ContentPost` comment layer so Preview and Production use the same enums, moderation fields, indexes, and `ContentPost.commentCount` / `lastCommentedAt` contract.

This repo already had a concrete `PostComment` model, so the merge was applied by extending that existing model instead of creating a duplicate `ContentPostComment` table.

## What Was Merged

- Added `ContentPostCommentStatus`
- Added `ContentPostCommentVisibility`
- Extended `ContentPost` with:
  - `lastCommentedAt`
  - feed-friendly indexes for `commentCount` and `lastCommentedAt`
- Extended the existing `PostComment` model with:
  - `bodyPlain`
  - `status`
  - `visibility`
  - `isPinned`
  - `isEdited`
  - `likeCount`
  - `replyCount`
  - `sortOrder`
  - moderation/audit fields
  - `publishedAt`
  - `deletedAt`
  - JSON metadata fields
- Added moderator relation wiring on `User`

## Important Repo-Specific Adaptation

The pack assumed a new `ContentPostComment` model. This repository already had:

- `PostComment`
- `parentCommentId`
- `userId`
- `comments PostComment[]` on `ContentPost`

To avoid a destructive duplicate comment table, the merge preserved those existing names and expanded them additively.

## Runtime Contract

The live comment routes and panel now treat these fields as the source of truth:

- visible comments: `status = ACTIVE` and `deletedAt IS NULL`
- hidden/moderated comments: `status IN (HIDDEN, PENDING_REVIEW, SPAM)` and `deletedAt IS NULL`
- removed comments: `status = REMOVED` with `deletedAt`

`isHidden` is still kept in sync as a compatibility bridge for older code paths.

## Rollout Order

1. Merge schema changes locally.
2. Run `npx prisma format`.
3. Run `npx prisma validate`.
4. Generate the migration locally.
5. Review the migration SQL before commit.
6. Apply the migration to Preview first.
7. Smoke-test comment create, reply, edit, hide, unhide, remove, and feed count refresh.
8. Apply the exact reviewed migration to Production.
9. Promote the matching app build only after database success.

## Suggested Commands

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate dev --name add_contentpost_comment_fields
```

For hosted rollout, use your reviewed migration workflow rather than editing the hosted database manually.

## Final Merge Check

Before shipping, confirm all code paths agree on:

- Prisma delegate name: `postComment`
- parent field name: `parentCommentId`
- account relation field: `userId`
- moderator relation field: `moderatedById`
- feed counter fields: `ContentPost.commentCount`, `ContentPost.lastCommentedAt`
- visibility source of truth: `status` + `deletedAt`
