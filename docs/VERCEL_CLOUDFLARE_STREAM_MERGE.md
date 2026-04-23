# Vercel + Cloudflare Stream Merge

Updated: 2026-04-23
## Goal

Merge Cloudflare Stream direct uploads into the existing Resurgence DX Next.js 15 + Prisma app deployed on Vercel, without reintroducing local filesystem video storage or splitting the feed into a second media system.

## Files Added In This Repo

- `src/app/api/media/cloudflare/direct-upload/route.ts`
- `src/components/resurgence/CloudflareDirectUploadForm.tsx`
- `src/components/resurgence/CloudflareStreamEmbed.tsx`
- `src/lib/cloudflare-stream.ts`

## Why This Fits The Current App

- The app already uses Next.js App Router and route handlers under `src/app/api`.
- Hosted deployments already target PostgreSQL.
- Feed posts already persist media through `ContentPost` and `MediaAsset`.
- `MediaAsset` already has `storageProvider`, `storageKey`, `contentType`, `size`, `durationSeconds`, and `metadataJson`, so the first rollout does not need a Prisma migration.

## Current Persistence Strategy

Cloudflare uploads are stored in the existing feed media record:

- `mediaType`: `VIDEO`
- `storageProvider`: `cloudflare-stream`
- `storageKey`: Cloudflare video UID
- `url`: Cloudflare Stream iframe playback URL
- `thumbnailUrl`: Cloudflare Stream thumbnail URL
- `metadataJson`: provider details such as `cloudflareVideoId`, `customerCode`, and original file name

This keeps the rollout migration-safe while still allowing `/feed` playback to recognize Cloudflare-backed videos.

## Required Vercel Environment Variables

Set these in both Preview and Production:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_STREAM_TOKEN`
- `CLOUDFLARE_STREAM_CUSTOMER_CODE`
- `CLOUDFLARE_STREAM_ALLOWED_ORIGINS`
- `CLOUDFLARE_STREAM_MAX_DURATION_SECONDS`
- `CLOUDFLARE_REQUIRE_SIGNED_URLS=false`

Use the repo example in [`../vercel.production.env.example`](../vercel.production.env.example).

## Important Auth Rule

The direct-upload route is now closed behind the current feed permission boundary:

- signed-in users only
- allowed roles: `CREATOR`, `STAFF`, `SYSTEM_ADMIN`

That matches the existing `canCreateFeedPost()` gate used by feed publishing.

## Current Creator Flow

Cloudflare upload UI is wired into `/creator/posts`.

Flow:

1. creator opens the post studio
2. creator chooses `Direct video`
3. creator uploads through Cloudflare Stream
4. the uploader returns:
   - Cloudflare video UID
   - iframe playback URL
   - thumbnail URL
5. the studio stores that media inside the existing post form
6. saving draft or submitting for review persists the Cloudflare details to Prisma
7. `/feed` renders the saved post through the Stream iframe

## Signed URL Limitation

This rollout does **not** implement tokenized signed playback for Stream embeds yet.

Because of that:

- keep `CLOUDFLARE_REQUIRE_SIGNED_URLS=false`
- do not switch signed playback on in Production for this phase

The route intentionally rejects signed-playback requests so Preview and Production do not drift into an upload-success but playback-fail state.

## Preview Smoke Test

Test this sequence in Vercel Preview:

1. log in as a creator
2. open `/creator/posts`
3. upload a video with the Cloudflare uploader
4. save draft or submit for review
5. confirm the new `MediaAsset` has:
   - `storageProvider = cloudflare-stream`
   - `storageKey = <video uid>`
6. confirm `/feed` renders the uploaded video
7. confirm no writes go to `public/uploads`

## Production Rollout Order

1. add env vars in Preview
2. deploy Preview
3. verify upload, save, and playback
4. mirror env vars in Production
5. deploy Production
6. run the route-by-route Vercel smoke tests

Also use:

- [VERCEL.md](./VERCEL.md)
- [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)

## CSP Note

The current repo does not ship a Content Security Policy header, so no CSP change was required for this merge.

If you later add CSP, Cloudflare's docs say the Stream player and direct uploads need `videodelivery.net` and `*.cloudflarestream.com` added to the relevant directives.
