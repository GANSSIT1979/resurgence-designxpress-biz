# Vercel And Cloudflare Stream Merge

Updated: 2026-05-05

## Purpose

This document explains the Cloudflare Stream direct upload integration for RESURGENCE on Vercel.

## Current Status

Cloudflare Stream is the production-safe path for creator video uploads. It avoids writing video files to Vercel local filesystem storage.

## Files

```txt
src/app/api/media/cloudflare/direct-upload/route.ts
src/components/resurgence/CloudflareDirectUploadForm.tsx
src/components/resurgence/CloudflareStreamEmbed.tsx
src/lib/cloudflare-stream.ts
```

## Data Model

Cloudflare media is stored through the existing feed media model:

```txt
MediaAsset.mediaType = VIDEO
MediaAsset.storageProvider = cloudflare-stream
MediaAsset.storageKey = Cloudflare video UID
MediaAsset.url = playback URL where stored
MediaAsset.thumbnailUrl = thumbnail URL where stored
MediaAsset.metadataJson.cloudflareVideoId = Cloudflare video UID
```

## Required Vercel Variables

```env
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_STREAM_TOKEN=
CLOUDFLARE_STREAM_CUSTOMER_CODE=
CLOUDFLARE_STREAM_ALLOWED_ORIGINS=https://www.resurgence-dx.biz,https://resurgence-dx.biz
CLOUDFLARE_STREAM_MAX_DURATION_SECONDS=180
CLOUDFLARE_REQUIRE_SIGNED_URLS=false
```

## Auth Rule

The direct upload route must remain protected. Allowed roles:

```txt
CREATOR
STAFF
SYSTEM_ADMIN
```

The route should use the same session and permission boundary used by creator post creation.

## Creator Flow

1. Creator opens `/creator/posts/new` or the active creator post composer.
2. Creator selects direct video upload.
3. App requests a Cloudflare direct upload URL.
4. Browser uploads directly to Cloudflare.
5. App receives Cloudflare video UID.
6. Creator saves draft or submits for review.
7. App persists `ContentPost` and `MediaAsset`.
8. Published/public content renders through `/feed`.

## Signed Playback Limitation

Signed Stream playback is not wired into public feed rendering yet. Keep:

```env
CLOUDFLARE_REQUIRE_SIGNED_URLS=false
```

Do not enable signed playback until feed embeds can generate and refresh signed tokens.

## Preview Smoke Test

1. Add Cloudflare env vars to Vercel Preview.
2. Deploy Preview.
3. Log in as a creator.
4. Upload a short MP4.
5. Save as draft or submit for review.
6. Confirm `MediaAsset.storageProvider = cloudflare-stream`.
7. Publish through the approved moderation path.
8. Confirm `/feed` playback works.
9. Confirm no writes are required under `public/uploads`.

## Production Rollout

1. Verify Preview upload/save/playback.
2. Mirror env vars to Production.
3. Redeploy with build cache disabled after env changes.
4. Smoke-test upload, save, and playback in Production.

## CSP Note

If a Content Security Policy is added later, include Cloudflare Stream player and upload domains such as `videodelivery.net` and `*.cloudflarestream.com` in the appropriate directives.
