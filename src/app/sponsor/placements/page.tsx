import { RoleShell } from '@/components/role-shell';
import { SponsorPlacementManager } from '@/components/sponsor/sponsor-placement-manager';
import { isMissingFeedTableError } from '@/lib/feed/queries';
import { prisma } from '@/lib/prisma';
import { sponsorNavItems } from '@/lib/sponsor';
import { listSponsorPlacements } from '@/lib/sponsor-placements';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';

export const dynamic = 'force-dynamic';

async function getPlacementOptions() {
  const [posts, products] = await Promise.all([
    prisma.contentPost.findMany({
      where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
      select: {
        id: true,
        caption: true,
        publishedAt: true,
        creatorProfile: { select: { name: true } },
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 60,
    }),
    prisma.shopProduct.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, price: true, imageUrl: true },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      take: 80,
    }),
  ]);

  return {
    posts: posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      creatorName: post.creatorProfile?.name ?? null,
      publishedAt: post.publishedAt?.toISOString() ?? null,
    })),
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
    })),
  };
}

export default async function SponsorPlacementsPage() {
  const context = await getCurrentSponsorContext();

  if (!context) {
    return (
      <main>
        <RoleShell
          roleLabel="Sponsor"
          title="Feed Placements"
          description="Request promoted feed placements for sponsor campaigns."
          navItems={sponsorNavItems as any}
          currentPath="/sponsor/placements"
        >
          <section className="card"><p className="section-copy">Please sign in with a sponsor account to continue.</p></section>
        </RoleShell>
      </main>
    );
  }

  let placements: Awaited<ReturnType<typeof listSponsorPlacements>> = [];
  let options: Awaited<ReturnType<typeof getPlacementOptions>> = { posts: [], products: [] };
  let dataError: string | null = null;

  try {
    [placements, options] = await Promise.all([
      listSponsorPlacements(context.sponsorProfile.id),
      getPlacementOptions(),
    ]);
  } catch (error) {
    console.error('Unable to load sponsor feed placements.', error);
    dataError = isMissingFeedTableError(error)
      ? 'Feed placement tables are not ready yet. Run the feed schema migration before using sponsor placements.'
      : 'Unable to load sponsor placement data right now.';
  }

  return (
    <main>
      <RoleShell
        roleLabel="Sponsor"
        title="Feed Placements"
        description="Plan sponsor visibility inside the TikTok-style creator-commerce feed while preserving the existing sponsorship workflow."
        navItems={sponsorNavItems as any}
        currentPath="/sponsor/placements"
      >
        {dataError ? (
          <section className="card">
            <div className="notice error">{dataError}</div>
            <p className="section-copy">Existing sponsor applications, deliverables, billing, and profile pages are unchanged.</p>
          </section>
        ) : (
          <SponsorPlacementManager
            sponsorName={context.sponsorProfile.companyName}
            initialPlacements={placements}
            posts={options.posts}
            products={options.products}
          />
        )}
      </RoleShell>
    </main>
  );
}
