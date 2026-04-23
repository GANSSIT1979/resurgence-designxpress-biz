import type { BuiltSharePayload, ShareSheetContext, ShareableFeedItem } from './types';

function asTrimmedText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function joinUrl(origin: string, path: string) {
  const normalizedOrigin = origin.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedOrigin}${normalizedPath}`;
}

function resolveUrl(origin: string | null, value: string | null | undefined) {
  if (!value) return null;
  if (isAbsoluteUrl(value)) return value;
  if (!origin) return value;
  return joinUrl(origin, value);
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

export function buildFeedPostUrl(item: ShareableFeedItem, context: ShareSheetContext = {}) {
  const origin = asTrimmedText(context.origin) ?? null;
  const canonicalUrl = resolveUrl(origin, item.canonicalUrl);
  if (canonicalUrl) return canonicalUrl;

  const basePath = context.feedBasePath || '/feed';
  const anchorUrl = `${basePath}#post-${encodeURIComponent(item.id)}`;
  return origin ? joinUrl(origin, anchorUrl) : anchorUrl;
}

export function buildCreatorUrl(item: ShareableFeedItem, context: ShareSheetContext = {}) {
  const origin = asTrimmedText(context.origin) ?? null;
  const directHref = resolveUrl(origin, item.creator?.href);
  if (directHref) return directHref;

  const slug = asTrimmedText(item.creator?.slug);
  if (!slug) return null;
  const path = `${context.creatorBasePath || '/creators'}/${encodeURIComponent(slug)}`;
  return origin ? joinUrl(origin, path) : path;
}

export function buildProductUrl(item: ShareableFeedItem, context: ShareSheetContext = {}) {
  const origin = asTrimmedText(context.origin) ?? null;
  const directHref = resolveUrl(origin, item.product?.href);
  if (directHref) return directHref;

  const slug = asTrimmedText(item.product?.slug);
  if (!slug) return null;
  const path = `${context.productBasePath || '/shop/product'}/${encodeURIComponent(slug)}`;
  return origin ? joinUrl(origin, path) : path;
}

export function buildSharePayload(item: ShareableFeedItem, context: ShareSheetContext = {}): BuiltSharePayload {
  const url = buildFeedPostUrl(item, context);
  const creatorUrl = buildCreatorUrl(item, context);
  const productUrl = buildProductUrl(item, context);

  const title =
    asTrimmedText(item.title) ||
    (item.creator?.label ? `${item.creator.label} on RESURGENCE` : null) ||
    'Watch on RESURGENCE';

  const caption = asTrimmedText(item.caption);
  const text = caption
    ? truncateText(caption, 140)
    : 'Watch this creator post on RESURGENCE.';

  return {
    title,
    text,
    url,
    creatorUrl,
    productUrl,
  };
}

export function buildExternalShareLinks(payload: BuiltSharePayload) {
  const encodedUrl = encodeURIComponent(payload.url);
  const encodedText = encodeURIComponent(`${payload.title} ${payload.url}`);

  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}`,
  };
}
