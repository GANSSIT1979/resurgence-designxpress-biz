import {
  getCloudflareStreamEmbedUrl,
  isCloudflareStreamAsset,
} from '@/lib/cloudflare-stream';

export function MediaRenderer({
  item,
  className = '',
}: {
  item: {
    mediaType: 'IMAGE' | 'VIDEO' | 'YOUTUBE' | 'VIMEO' | string;
    url: string;
    thumbnailUrl?: string | null;
    storageProvider?: string | null;
    storageKey?: string | null;
    metadata?: Record<string, unknown> | null;
    caption?: string | null;
  };
  className?: string;
}) {
  if (item.mediaType === 'IMAGE') {
    return <img src={item.url} alt={item.caption || 'Gallery image'} className={className} style={{ width: '100%', borderRadius: 16, display: 'block', objectFit: 'cover' }} />;
  }

  if (item.mediaType === 'VIDEO') {
    if (isCloudflareStreamAsset(item)) {
      const embedUrl = getCloudflareStreamEmbedUrl(item, { muted: true });
      if (!embedUrl) return null;

      return (
        <iframe
          src={embedUrl}
          title={item.caption || 'Cloudflare Stream video'}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={className}
          style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 16 }}
        />
      );
    }

    return <video src={item.url} controls className={className} style={{ width: '100%', borderRadius: 16, display: 'block' }} />;
  }

  if (item.mediaType === 'YOUTUBE') {
    const id = extractYouTubeId(item.url);
    if (!id) return null;
    return (
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={item.caption || 'YouTube video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={className}
        style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 16 }}
      />
    );
  }

  if (item.mediaType === 'VIMEO') {
    const id = extractVimeoId(item.url);
    if (!id) return null;
    return (
      <iframe
        src={`https://player.vimeo.com/video/${id}`}
        title={item.caption || 'Vimeo video'}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className={className}
        style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 16 }}
      />
    );
  }

  return null;
}

function extractYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || '';
}

function extractVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] || '';
}
