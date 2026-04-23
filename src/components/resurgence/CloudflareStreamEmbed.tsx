'use client';

import { getCloudflareStreamEmbedUrl } from '@/lib/cloudflare-stream';

export default function CloudflareStreamEmbed({
  embedUrl,
  title = 'Cloudflare Stream video',
  vertical = false,
  autoplay = false,
  muted = true,
  className = '',
}: {
  embedUrl: string;
  title?: string;
  vertical?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
}) {
  const resolvedUrl = getCloudflareStreamEmbedUrl(
    { url: embedUrl, storageProvider: 'cloudflare-stream' },
    { autoplay, muted },
  );

  if (!resolvedUrl) {
    return (
      <div
        className={`flex min-h-44 items-center justify-center rounded-[24px] border border-white/10 bg-black/40 px-4 py-8 text-center text-sm text-white/60 ${className}`}
      >
        Cloudflare Stream preview is not available yet.
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-black ${
        vertical ? 'aspect-[9/16]' : 'aspect-video'
      } ${className}`}
    >
      <iframe
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        src={resolvedUrl}
        title={title}
      />
    </div>
  );
}
