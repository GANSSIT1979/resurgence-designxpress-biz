import { prisma } from '@/lib/prisma';
import { sponsorPlacementSchema } from '@/lib/validation';

const sponsorEditableStatuses = new Set(['DRAFT', 'PENDING', 'REJECTED', 'CANCELLED']);

function nullableText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

function nullableNumber(value: string | number | undefined) {
  if (value === '' || value === undefined || value === null) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function nullableDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function serializeSponsorPlacement(item: any) {
  return {
    id: item.id,
    title: item.title,
    placementType: item.placementType,
    status: item.status,
    startsAt: item.startsAt?.toISOString() ?? null,
    endsAt: item.endsAt?.toISOString() ?? null,
    ctaLabel: item.ctaLabel ?? null,
    ctaHref: item.ctaHref ?? null,
    budgetAmount: item.budgetAmount ?? null,
    impressionGoal: item.impressionGoal ?? null,
    impressionCount: item.impressionCount ?? 0,
    clickCount: item.clickCount ?? 0,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    post: item.post
      ? {
          id: item.post.id,
          caption: item.post.caption,
          summary: item.post.summary ?? null,
          publishedAt: item.post.publishedAt?.toISOString() ?? null,
          creatorName: item.post.creatorProfile?.name ?? null,
        }
      : null,
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          imageUrl: item.product.imageUrl ?? null,
          price: item.product.price,
        }
      : null,
    sponsorName: item.sponsor?.name ?? item.sponsorProfile?.companyName ?? null,
  };
}

export const sponsorPlacementInclude = {
  sponsor: { select: { id: true, name: true, tier: true } },
  sponsorProfile: { select: { id: true, companyName: true } },
  product: { select: { id: true, name: true, slug: true, imageUrl: true, price: true } },
  post: {
    select: {
      id: true,
      caption: true,
      summary: true,
      publishedAt: true,
      creatorProfile: { select: { name: true, slug: true } },
    },
  },
} as const;

async function assertPlacementTargets(postId?: string | null, productId?: string | null) {
  if (postId) {
    const post = await prisma.contentPost.findFirst({
      where: { id: postId, status: 'PUBLISHED', visibility: 'PUBLIC' },
      select: { id: true },
    });
    if (!post) return 'Choose a published public feed post.';
  }

  if (productId) {
    const product = await prisma.shopProduct.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) return 'Choose an active merch product.';
  }

  return null;
}

function placementData(parsed: ReturnType<typeof sponsorPlacementSchema.parse>, sponsorProfile: { id: string; sponsorId: string | null }) {
  return {
    sponsorProfileId: sponsorProfile.id,
    sponsorId: sponsorProfile.sponsorId,
    title: parsed.title,
    placementType: nullableText(parsed.placementType) || 'FEED_PROMOTION',
    status: parsed.status,
    postId: nullableText(parsed.postId),
    productId: nullableText(parsed.productId),
    startsAt: nullableDate(parsed.startsAt),
    endsAt: nullableDate(parsed.endsAt),
    ctaLabel: nullableText(parsed.ctaLabel),
    ctaHref: nullableText(parsed.ctaHref),
    budgetAmount: nullableNumber(parsed.budgetAmount),
    impressionGoal: nullableNumber(parsed.impressionGoal),
  };
}

export async function listSponsorPlacements(sponsorProfileId: string) {
  const items = await prisma.sponsoredPlacement.findMany({
    where: { sponsorProfileId },
    include: sponsorPlacementInclude,
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  });

  return items.map(serializeSponsorPlacement);
}

export async function createSponsorPlacement(sponsorProfile: { id: string; sponsorId: string | null }, body: unknown) {
  const parsed = sponsorPlacementSchema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid placement request. Add a title and valid dates, URLs, budget, and goals.' };

  const targetError = await assertPlacementTargets(parsed.data.postId, parsed.data.productId);
  if (targetError) return { error: targetError };

  const item = await prisma.sponsoredPlacement.create({
    data: placementData(parsed.data, sponsorProfile),
    include: sponsorPlacementInclude,
  });

  return { item: serializeSponsorPlacement(item) };
}

export async function updateSponsorPlacement(sponsorProfile: { id: string; sponsorId: string | null }, placementId: string, body: unknown) {
  const existing = await prisma.sponsoredPlacement.findFirst({
    where: { id: placementId, sponsorProfileId: sponsorProfile.id },
    select: { id: true, status: true },
  });

  if (!existing) return { error: 'Placement request not found.', status: 404 };

  const parsed = sponsorPlacementSchema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid placement update. Check dates, URLs, budget, and goals.' };

  if (!sponsorEditableStatuses.has(existing.status) && parsed.data.status !== 'CANCELLED') {
    return { error: 'This placement is already approved or active. Contact the admin team for changes.', status: 409 };
  }

  const targetError = await assertPlacementTargets(parsed.data.postId, parsed.data.productId);
  if (targetError) return { error: targetError };

  const item = await prisma.sponsoredPlacement.update({
    where: { id: placementId },
    data: placementData(parsed.data, sponsorProfile),
    include: sponsorPlacementInclude,
  });

  return { item: serializeSponsorPlacement(item) };
}

export async function cancelSponsorPlacement(sponsorProfileId: string, placementId: string) {
  const existing = await prisma.sponsoredPlacement.findFirst({
    where: { id: placementId, sponsorProfileId },
    select: { id: true },
  });

  if (!existing) return { error: 'Placement request not found.', status: 404 };

  const item = await prisma.sponsoredPlacement.update({
    where: { id: placementId },
    data: { status: 'CANCELLED' },
    include: sponsorPlacementInclude,
  });

  return { item: serializeSponsorPlacement(item) };
}
