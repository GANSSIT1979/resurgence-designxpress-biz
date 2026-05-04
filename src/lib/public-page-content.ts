import { prisma } from '@/lib/prisma';

export const PUBLIC_PAGE_CONTENT_KEYS = {
  eventsHero: 'events.hero',
  eventsOverview: 'events.overview',
  partnershipsHero: 'partnerships.hero',
  partnershipsPaths: 'partnerships.paths',
  supportHero: 'support.hero',
  supportRouting: 'support.routing',
  supportRules: 'support.rules',
} as const;

export type PublicPageContentKey =
  (typeof PUBLIC_PAGE_CONTENT_KEYS)[keyof typeof PUBLIC_PAGE_CONTENT_KEYS];

export type PublicPageContentItem = {
  key: string;
  title: string;
  body: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type PublicPageContentMap = Record<string, PublicPageContentItem>;

export async function getPublicPageContentMap(
  keys: readonly string[],
): Promise<PublicPageContentMap> {
  if (!keys.length) return {};

  try {
    const rows = await prisma.pageContent.findMany({
      where: {
        key: {
          in: [...keys],
        },
      },
      select: {
        key: true,
        title: true,
        body: true,
        ctaLabel: true,
        ctaHref: true,
      },
    });

    return rows.reduce<PublicPageContentMap>((map, row) => {
      map[row.key] = {
        key: row.key,
        title: row.title,
        body: row.body,
        ctaLabel: row.ctaLabel,
        ctaHref: row.ctaHref,
      };

      return map;
    }, {});
  } catch (error) {
    console.error('[public-page-content] Failed to load CMS content', error);
    return {};
  }
}

export function getPublicPageContent(
  contentMap: PublicPageContentMap,
  key: PublicPageContentKey,
  fallback: Omit<PublicPageContentItem, 'key'>,
): PublicPageContentItem {
  const content = contentMap[key];

  if (!content) {
    return {
      key,
      ...fallback,
    };
  }

  return {
    key,
    title: content.title || fallback.title,
    body: content.body || fallback.body,
    ctaLabel: content.ctaLabel ?? fallback.ctaLabel ?? null,
    ctaHref: content.ctaHref ?? fallback.ctaHref ?? null,
  };
}
