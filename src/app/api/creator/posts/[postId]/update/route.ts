import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import {
  canActorManageCreatorPost,
  requireCreatorActionActor,
} from '@/lib/creator-posts/action-auth';
import {
  getCreatorActionPost,
  updateCreatorEditablePost,
} from '@/lib/creator-posts/action-posts';
import type {
  CreatorPostEditPayload,
  CreatorPostEditVisibility,
} from '@/lib/creator-posts/edit-types';
import { feedRouteError } from '@/lib/feed/api';

export const runtime = 'nodejs';

const allowedVisibility = new Set(['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE']);

function normalizeText(value: unknown, max = 4000) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function normalizeHashtags(value: unknown) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;

  return Array.from(
    new Set(
      value
        .map((item) =>
          typeof item === 'string'
            ? item.trim().replace(/^#+/g, '').slice(0, 50)
            : '',
        )
        .filter(Boolean),
    ),
  ).slice(0, 12);
}

function normalizeNumber(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return undefined;
  return number;
}

function normalizeMeta(value: unknown) {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [key.trim(), typeof entry === 'string' ? entry.trim() : String(entry)])
      .filter(([key, entry]) => key && entry),
  );
}

function buildPayload(body: Record<string, unknown>): CreatorPostEditPayload | null {
  const visibility: CreatorPostEditVisibility | undefined | null =
    typeof body.visibility === 'string' && allowedVisibility.has(body.visibility)
      ? (body.visibility as CreatorPostEditVisibility)
      : body.visibility === undefined
        ? undefined
        : null;

  if (visibility === null) return null;

  return {
    title: normalizeText(body.title, 180),
    caption: normalizeText(body.caption, 2200),
    hashtags: normalizeHashtags(body.hashtags),
    visibility,
    posterUrl: normalizeText(body.posterUrl, 2048),
    thumbnailUrl: normalizeText(body.thumbnailUrl, 2048),
    originalFileName: normalizeText(body.originalFileName, 255),
    durationSeconds: normalizeNumber(body.durationSeconds),
    aspectRatio: normalizeText(body.aspectRatio, 32),
    altText: normalizeText(body.altText, 500),
    locationLabel: normalizeText(body.locationLabel, 255),
    languageCode: normalizeText(body.languageCode, 16),
    meta: normalizeMeta(body.meta),
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { actor, error } = await requireCreatorActionActor(request);
  if (error || !actor) return error;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const payload = buildPayload(body);
    if (!payload) return fail('Invalid visibility value.', 400);

    const { postId } = await params;
    const post = await getCreatorActionPost(postId);
    if (!post) return fail('Creator post not found.', 404);
    if (!canActorManageCreatorPost(actor, post)) return fail('Forbidden.', 403);

    const result = await updateCreatorEditablePost(postId, payload, actor.id);
    if ('error' in result) return fail(result.error, 400);

    return ok({ success: true, post: result.post });
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
