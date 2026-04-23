import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/auth-server';
import {
  buildCloudflareStreamEmbedUrl,
  buildCloudflareStreamThumbnailUrl,
  normalizeCloudflareCustomerCode,
} from '@/lib/cloudflare-stream';
import { canCreateFeedPost } from '@/lib/feed/authorization';

export const runtime = 'nodejs';

type DirectUploadBody = {
  fileName?: string;
  creatorId?: string;
  maxDurationSeconds?: number;
  requireSignedURLs?: boolean;
  meta?: Record<string, unknown>;
};

function parseBoolean(value: string | undefined, fallback = false) {
  if (typeof value !== 'string') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeFileName(fileName: string | undefined) {
  if (!fileName) return 'upload.mp4';
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180) || 'upload.mp4';
}

function normalizeMaxDurationSeconds(value: number | undefined, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  if (value < 1) return 1;
  if (value > 60 * 60 * 12) return 60 * 60 * 12;
  return Math.floor(value);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in first.' },
        { status: 401 },
      );
    }

    if (!canCreateFeedPost(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden. Creator, staff, or admin access is required.',
        },
        { status: 403 },
      );
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_TOKEN;
    const customerCode = normalizeCloudflareCustomerCode(
      process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE,
    );

    if (!accountId || !apiToken || !customerCode) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_STREAM_TOKEN, or CLOUDFLARE_STREAM_CUSTOMER_CODE.',
        },
        { status: 500 },
      );
    }

    const fallbackMaxDuration = normalizeMaxDurationSeconds(
      Number(process.env.CLOUDFLARE_STREAM_MAX_DURATION_SECONDS || 180),
      180,
    );

    const configuredAllowedOrigins = parseAllowedOrigins(
      process.env.CLOUDFLARE_STREAM_ALLOWED_ORIGINS,
    );

    const defaultRequireSignedURLs = parseBoolean(
      process.env.CLOUDFLARE_REQUIRE_SIGNED_URLS,
      false,
    );

    const body = ((await request.json().catch(() => ({}))) || {}) as DirectUploadBody;

    const fileName = sanitizeFileName(body.fileName);
    const creatorId = (body.creatorId || user.id).slice(0, 120);
    const requireSignedURLs =
      typeof body.requireSignedURLs === 'boolean'
        ? body.requireSignedURLs
        : defaultRequireSignedURLs;

    if (requireSignedURLs) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Signed Cloudflare playback URLs are not wired into the feed yet. Set CLOUDFLARE_REQUIRE_SIGNED_URLS=false for this rollout.',
        },
        { status: 400 },
      );
    }

    const maxDurationSeconds = normalizeMaxDurationSeconds(
      body.maxDurationSeconds,
      fallbackMaxDuration,
    );

    const cfPayload = {
      maxDurationSeconds,
      allowedOrigins:
        configuredAllowedOrigins.length > 0 ? configuredAllowedOrigins : undefined,
      creator: creatorId,
      meta: {
        name: fileName,
        uploadedByUserId: user.id,
        uploadedByRole: user.role,
        ...(body.meta || {}),
      },
      requireSignedURLs,
      thumbnailTimestampPct: 0.53,
    };

    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(cfPayload),
        cache: 'no-store',
      },
    );

    const cfJson = await cfResponse.json().catch(() => null);

    if (
      !cfResponse.ok ||
      !cfJson?.success ||
      !cfJson?.result?.uploadURL ||
      !cfJson?.result?.uid
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudflare Stream direct upload request failed.',
          details: cfJson,
        },
        { status: 400 },
      );
    }

    const uid = cfJson.result.uid as string;
    const previewURL = buildCloudflareStreamEmbedUrl({
      customerCode,
      videoId: uid,
    });
    const thumbnailURL = buildCloudflareStreamThumbnailUrl({
      customerCode,
      videoId: uid,
    });

    return NextResponse.json(
      {
        success: true,
        uid,
        uploadURL: cfJson.result.uploadURL as string,
        previewURL,
        thumbnailURL,
        customerCode,
        requireSignedURLs,
        allowedOrigins: configuredAllowedOrigins,
        fileName,
        creatorId,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Unexpected server error while creating a Cloudflare Stream direct upload URL.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
