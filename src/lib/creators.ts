export const creatorNavItems = [
  { href: '/creator/dashboard', label: 'Dashboard' },
  { href: '/creator/posts', label: 'Feed Posts' },
  { href: '/creators', label: 'Public Directory' },
] as const;

export const missingCreatorValue = 'Not yet provided';

export type CreatorStatus = 'Active' | 'Inactive';

export type CreatorDisplayProfile = {
  id: string;
  userId?: string | null;
  user?: {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
  } | null;
  name: string;
  slug: string;
  roleLabel: string;
  platformFocus: string;
  audience: string;
  biography: string | null;
  journeyStory: string | null;
  contactNumber?: string | null;
  address?: string | null;
  dateOfBirth?: Date | string | null;
  jobDescription?: string | null;
  position?: string | null;
  height?: string | null;
  facebookPage?: string | null;
  facebookFollowers?: string | null;
  tiktokPage?: string | null;
  tiktokFollowers?: string | null;
  instagramPage?: string | null;
  instagramFollowers?: string | null;
  youtubePage?: string | null;
  youtubeFollowers?: string | null;
  trendingVideoUrl?: string | null;
  shortBio?: string | null;
  pointsPerGame: number | null;
  assistsPerGame: number | null;
  reboundsPerGame: number | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type SocialDefinition = {
  key: 'facebook' | 'tiktok' | 'instagram' | 'youtube';
  label: string;
  linkLabel: string;
  emptyLabel: string;
  urlField: keyof CreatorDisplayProfile;
  followersField: keyof CreatorDisplayProfile;
};

export const creatorSocialDefinitions: SocialDefinition[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    linkLabel: 'View Facebook Page',
    emptyLabel: 'No Facebook link available',
    urlField: 'facebookPage',
    followersField: 'facebookFollowers',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    linkLabel: 'View TikTok',
    emptyLabel: 'No TikTok link available',
    urlField: 'tiktokPage',
    followersField: 'tiktokFollowers',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    linkLabel: 'View Instagram',
    emptyLabel: 'No Instagram link available',
    urlField: 'instagramPage',
    followersField: 'instagramFollowers',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    linkLabel: 'Open YouTube Channel',
    emptyLabel: 'No YouTube link available',
    urlField: 'youtubePage',
    followersField: 'youtubeFollowers',
  },
];

export function displayCreatorValue(value: unknown) {
  if (value === null || value === undefined) return missingCreatorValue;
  const text = String(value).trim();
  return text || missingCreatorValue;
}

export function slugifyCreatorName(input: string) {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'creator';
}

export function normalizeExternalUrl(value: unknown) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidExternalUrl(value: unknown) {
  const normalized = normalizeExternalUrl(value);
  if (!normalized) return false;

  try {
    const url = new URL(normalized);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function safeExternalUrl(value: unknown) {
  const normalized = normalizeExternalUrl(value);
  return isValidExternalUrl(normalized) ? normalized : '';
}

export function formatCreatorDate(value: Date | string | null | undefined) {
  if (!value) return missingCreatorValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return missingCreatorValue;

  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatCreatorShortDate(value: Date | string | null | undefined) {
  if (!value) return missingCreatorValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return missingCreatorValue;

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateInput(value: Date | string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function formatFollowerLabel(value: string | number | null | undefined, platform?: string) {
  if (value === null || value === undefined || value === '') return missingCreatorValue;

  if (typeof value === 'number') {
    const noun = platform === 'youtube' ? 'subscribers' : 'followers';
    return `${formatCompactNumber(value)} ${noun}`;
  }

  const text = value.trim().replace(/\s+/g, ' ');
  if (!text) return missingCreatorValue;
  if (/followers?|subscribers?/i.test(text)) return text;

  const numeric = parseFollowerCount(text);
  if (numeric > 0) {
    const noun = platform === 'youtube' ? 'subscribers' : 'followers';
    return `${formatCompactNumber(numeric)} ${noun}`;
  }

  return text;
}

export function parseFollowerCount(value: string | number | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value) return 0;

  const text = String(value).toLowerCase().replace(/,/g, '').trim();
  const match = text.match(/([0-9]+(?:\.[0-9]+)?)\s*([kmb])?/);
  if (!match) return 0;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return 0;

  const suffix = match[2];
  if (suffix === 'b') return amount * 1_000_000_000;
  if (suffix === 'm') return amount * 1_000_000;
  if (suffix === 'k') return amount * 1_000;
  return amount;
}

export function formatCompactNumber(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0';

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 1_000_000 ? 2 : 1,
  }).format(value);
}

export function getCreatorSocialLinks(creator: CreatorDisplayProfile) {
  return creatorSocialDefinitions.map((definition) => {
    const url = safeExternalUrl(creator[definition.urlField]);
    const rawFollowers = creator[definition.followersField];
    const followerCount = parseFollowerCount(rawFollowers as string | number | null | undefined);

    return {
      ...definition,
      url,
      followers: formatFollowerLabel(rawFollowers as string | number | null | undefined, definition.key),
      followerCount,
      isLinked: Boolean(url),
    };
  });
}

export function getLinkedCreatorSocials(creator: CreatorDisplayProfile) {
  return getCreatorSocialLinks(creator).filter((item) => item.isLinked);
}

export function getCreatorStats(creator: CreatorDisplayProfile) {
  const socials = getCreatorSocialLinks(creator);
  const linkedSocials = socials.filter((item) => item.isLinked);
  const totalFollowers = socials.reduce((sum, item) => sum + item.followerCount, 0);
  const highest = [...socials].sort((left, right) => right.followerCount - left.followerCount)[0];
  const completenessFields = [
    creator.name,
    creator.contactNumber,
    creator.address,
    creator.dateOfBirth,
    creator.jobDescription,
    creator.position,
    creator.height,
    creator.imageUrl,
    creator.shortBio || creator.biography,
    creator.trendingVideoUrl,
    creator.facebookPage,
    creator.tiktokPage,
    creator.instagramPage,
    creator.youtubePage,
  ];
  const completedFields = completenessFields.filter((value) => {
    if (value instanceof Date) return !Number.isNaN(value.getTime());
    return Boolean(String(value ?? '').trim());
  }).length;
  const completeness = Math.round((completedFields / completenessFields.length) * 100);

  return {
    linkedPlatformCount: linkedSocials.length,
    highestPlatform: highest?.followerCount ? highest.label : missingCreatorValue,
    highestPlatformFollowers: highest?.followerCount ? formatFollowerLabel(highest.followerCount, highest.key) : missingCreatorValue,
    totalFollowers,
    totalFollowersLabel: totalFollowers ? `${formatCompactNumber(totalFollowers)} visible followers` : missingCreatorValue,
    completeness,
  };
}

export function getCreatorStatus(creator: Pick<CreatorDisplayProfile, 'isActive'>): CreatorStatus {
  return creator.isActive ? 'Active' : 'Inactive';
}

export function getCreatorPrimaryRole(creator: CreatorDisplayProfile) {
  return displayCreatorValue(creator.position || creator.roleLabel);
}

export function getCreatorBio(creator: CreatorDisplayProfile) {
  return displayCreatorValue(creator.shortBio || creator.biography || creator.jobDescription || creator.platformFocus);
}

export function getEmbeddableVideoUrl(value: string | null | undefined) {
  const url = safeExternalUrl(value);
  if (!url) return null;

  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return {
      platform: 'YouTube',
      url,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`,
    };
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      platform: 'Vimeo',
      url,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  if (/facebook\.com/i.test(url)) {
    return {
      platform: 'Facebook',
      url,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=720`,
    };
  }

  return { platform: 'External', url, embedUrl: '' };
}

export function serializeCreatorProfile<T extends CreatorDisplayProfile>(item: T) {
  const { user, ...creator } = item as any;

  return {
    ...creator,
    user: user
      ? {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          isActive: user.isActive,
        }
      : null,
    dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toISOString() : null,
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString(),
  };
}

export function serializePublicCreatorProfile<T extends CreatorDisplayProfile>(item: T) {
  const creator = serializeCreatorProfile(item);

  return {
    ...creator,
    user: null,
    contactNumber: null,
    address: null,
    dateOfBirth: null,
  };
}

function extractYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || '';
}

function extractVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] || '';
}
