import Link from 'next/link';
import { CreatorPostManager } from '@/components/creator/creator-post-manager';
import { RoleShell } from '@/components/role-shell';
import { creatorNavItems } from '@/lib/creators';
import { serializeContentPost } from '@/lib/feed/serializers';
import type { FeedPost } from '@/lib/feed/types';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

async function getCreatorPosts(userId: string, creatorProfileId: string) {
  const posts = await prisma.contentPost.findMany({
    where: {
      status: { not: 'DELETED' },
      OR: [{ authorUserId: userId }, { creatorProfileId }],
    },
    include: {
      authorUser: { select: { id: true, displayName: true, role: true } },
      creatorProfile: {
        select: {
          id: true,
          name: true,
          slug: true,
          roleLabel: true,
          imageUrl: true,
          followers: {
            where: { followerUserId: userId },
            select: { followerUserId: true },
          },
        },
      },
      mediaAssets: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      hashtags: { include: { hashtag: true }, orderBy: { createdAt: 'asc' } },
      productTags: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              price: true,
              stock: true,
              badgeLabel: true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
      sponsoredPlacements: {
        include: {
          sponsor: { select: { name: true } },
          sponsorProfile: { select: { companyName: true } },
        },
      },
      likes: { where: { userId }, select: { userId: true } },
      saves: { where: { userId }, select: { userId: true } },
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  });

  return posts.map((post) => serializeContentPost(post, userId));
}

async function getProductOptions() {
  const products = await prisma.shopProduct.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      stock: true,
      isFeatured: true,
      sortOrder: true,
    },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    price: product.price,
    stock: product.stock,
  }));
}

export default async function CreatorPostsPage() {
  const context = await getCurrentSessionUser();

  if (!context || context.user.role !== 'CREATOR') {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Creator Feed Posts"
          description="Sign in as a creator to manage feed content, merch tags, hashtags, and post submissions."
          navItems={[...creatorNavItems]}
          currentPath="/creator/posts"
        >
          <section className="card">
            <p className="section-copy">Please sign in with a creator account to continue.</p>
            <Link className="button-link" href="/login">Login</Link>
          </section>
        </RoleShell>
      </main>
    );
  }

  const creator = await prisma.creatorProfile.findUnique({
    where: { userId: context.user.id },
    select: { id: true, name: true, slug: true },
  });

  if (!creator) {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Creator Feed Posts"
          description="Your creator user is active, but no creator profile has been linked yet."
          navItems={[...creatorNavItems]}
          currentPath="/creator/posts"
        >
          <section className="card">
            <div className="section-kicker">Profile Not Linked</div>
            <h2 style={{ marginTop: 0 }}>Ask an admin to link your creator account.</h2>
            <p className="section-copy">
              Feed publishing needs a linked creator profile so every post can point to the correct public creator page and sponsor-ready profile.
            </p>
            <div className="btn-row">
              <Link className="button-link" href="/creators">View Public Creators</Link>
              <Link className="button-link btn-secondary" href="/contact">Contact Support</Link>
            </div>
          </section>
        </RoleShell>
      </main>
    );
  }

  let posts: FeedPost[] = [];
  let products: Awaited<ReturnType<typeof getProductOptions>> = [];
  let dataError: string | null = null;

  try {
    [posts, products] = await Promise.all([
      getCreatorPosts(context.user.id, creator.id),
      getProductOptions(),
    ]);
  } catch (error) {
    console.error('Unable to load creator feed studio data.', error);
    dataError = 'Creator feed tables are not ready yet. Run the feed schema migration before using the post studio.';
  }

  return (
    <main>
      <RoleShell
        roleLabel="Creator"
        title="Creator Feed Posts"
        description="Create, update, and review your TikTok-style creator-commerce feed content for Resurgence Powered by DesignXpress."
        navItems={[...creatorNavItems]}
        currentPath="/creator/posts"
      >
        <div className="btn-row" style={{ marginBottom: 18 }}>
          <Link className="button-link" href="/creator/posts/new">Open New Post Composer</Link>
          <Link className="button-link btn-secondary" href={`/creators/${creator.slug}`}>Open Public Profile</Link>
        </div>
        {dataError ? (
          <section className="card">
            <div className="notice error">{dataError}</div>
            <p className="section-copy">No existing creator, sponsor, shop, or auth workflow was changed. Apply the migration from the schema PR, then reload this page.</p>
          </section>
        ) : (
          <CreatorPostManager
            creatorId={creator.id}
            creatorName={creator.name}
            initialPosts={posts}
            products={products}
            publicProfileHref={`/creators/${creator.slug}`}
          />
        )}
      </RoleShell>
    </main>
  );
}
