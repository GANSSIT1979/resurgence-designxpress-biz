export const CLOUDFLARE_STREAM_STORAGE_PROVIDER = 'cloudflare-stream';

type CloudflareStreamSource = {
  url?: string | null;
  storageProvider?: string | null;
  storageKey?: string | null;
  metadata?: Record<string, unknown> | null;
};

type CloudflareStreamEmbedOptions = {
  autoplay?: boolean;
  muted?: boolean;
};

function normalizeText(value: string | null | undefined) {
  return typeof value === 'string' ? value.trim() : '';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function normalizeCloudflareCustomerCode(value: string | null | undefined) {
  return normalizeText(value)
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/g, '')
    .replace(/\.cloudflarestream\.com$/i, '')
    .replace(/^customer-/i, '');
}

export function buildCloudflareStreamCustomerHost(customerCode: string | null | undefined) {
  const normalized = normalizeCloudflareCustomerCode(customerCode);
  return normalized ? `customer-${normalized}.cloudflarestream.com` : '';
}

export function buildCloudflareStreamEmbedUrl({
  customerCode,
  videoId,
  autoplay = false,
  muted = true,
}: {
  customerCode: string | null | undefined;
  videoId: string | null | undefined;
  autoplay?: boolean;
  muted?: boolean;
}) {
  const customerHost = buildCloudflareStreamCustomerHost(customerCode);
  const safeVideoId = normalizeText(videoId);
  if (!customerHost || !safeVideoId) return '';

  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', 'true');
  if (muted) params.set('muted', 'true');

  return `https://${customerHost}/${safeVideoId}/iframe${params.size ? `?${params.toString()}` : ''}`;
}

export function buildCloudflareStreamThumbnailUrl({
  customerCode,
  videoId,
  time = '1s',
  height = 720,
}: {
  customerCode: string | null | undefined;
  videoId: string | null | undefined;
  time?: string;
  height?: number;
}) {
  const customerHost = buildCloudflareStreamCustomerHost(customerCode);
  const safeVideoId = normalizeText(videoId);
  if (!customerHost || !safeVideoId) return '';

  const params = new URLSearchParams({
    time,
    height: String(Math.max(120, Math.floor(height))),
  });

  return `https://${customerHost}/${safeVideoId}/thumbnails/thumbnail.jpg?${params.toString()}`;
}

export function parseCloudflareStreamEmbedUrl(url: string | null | undefined) {
  const safeUrl = normalizeText(url);
  if (!safeUrl) return null;

  try {
    const parsed = new URL(safeUrl);
    if (!/\.cloudflarestream\.com$/i.test(parsed.hostname)) return null;

    const match = parsed.pathname.match(/^\/([^/]+)\/iframe\/?$/i);
    if (!match) return null;

    return {
      customerHost: parsed.hostname,
      customerCode: normalizeCloudflareCustomerCode(parsed.hostname),
      videoId: match[1],
    };
  } catch {
    return null;
  }
}

export function deriveCloudflareStreamThumbnailUrl(url: string | null | undefined) {
  const parsed = parseCloudflareStreamEmbedUrl(url);
  if (!parsed) return '';

  return buildCloudflareStreamThumbnailUrl({
    customerCode: parsed.customerCode,
    videoId: parsed.videoId,
  });
}

export function isCloudflareStorageProvider(value: string | null | undefined) {
  return normalizeText(value).toLowerCase() === CLOUDFLARE_STREAM_STORAGE_PROVIDER;
}

export function getCloudflareStreamVideoId(source: CloudflareStreamSource) {
  const storageKey = normalizeText(source.storageKey);
  if (storageKey) return storageKey;

  const metadata = asRecord(source.metadata);
  const metadataId =
    metadata && typeof metadata.cloudflareVideoId === 'string'
      ? normalizeText(metadata.cloudflareVideoId)
      : '';
  if (metadataId) return metadataId;

  return parseCloudflareStreamEmbedUrl(source.url)?.videoId || '';
}

export function getCloudflareStreamCustomerCode(source: CloudflareStreamSource) {
  const metadata = asRecord(source.metadata);
  const metadataCode =
    metadata && typeof metadata.customerCode === 'string'
      ? metadata.customerCode
      : metadata && typeof metadata.customerHost === 'string'
        ? metadata.customerHost
        : null;

  return (
    normalizeCloudflareCustomerCode(metadataCode) ||
    parseCloudflareStreamEmbedUrl(source.url)?.customerCode ||
    ''
  );
}

export function isCloudflareStreamAsset(source: CloudflareStreamSource) {
  return Boolean(
    isCloudflareStorageProvider(source.storageProvider) ||
      parseCloudflareStreamEmbedUrl(source.url) ||
      (getCloudflareStreamVideoId(source) && getCloudflareStreamCustomerCode(source)),
  );
}

export function getCloudflareStreamEmbedUrl(
  source: CloudflareStreamSource,
  options: CloudflareStreamEmbedOptions = {},
) {
  const parsed = parseCloudflareStreamEmbedUrl(source.url);
  if (parsed) {
    return buildCloudflareStreamEmbedUrl({
      customerCode: parsed.customerCode,
      videoId: parsed.videoId,
      autoplay: options.autoplay,
      muted: options.muted,
    });
  }

  const customerCode = getCloudflareStreamCustomerCode(source);
  const videoId = getCloudflareStreamVideoId(source);
  if (!customerCode || !videoId) return normalizeText(source.url);

  return buildCloudflareStreamEmbedUrl({
    customerCode,
    videoId,
    autoplay: options.autoplay,
    muted: options.muted,
  });
}
