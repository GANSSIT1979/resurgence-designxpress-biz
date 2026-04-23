import Link from 'next/link';
import type { Metadata } from 'next';
import CreatorPostComposer from '@/components/resurgence/CreatorPostComposer';
import { RoleShell } from '@/components/role-shell';
import { creatorNavItems } from '@/lib/creators';
import { serializeContentPost } from '@/lib/feed/serializers';
import type { FeedPost } from '@/lib/feed/types';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/session-server';

type SearchParamsInput = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: SearchParamsInput | Promise<SearchParamsInput>;
};

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Creator Post Composer | RESURGENCE Powered by DesignXpress',
  description: 'Upload or edit creator video posts in the Prisma-backed creator-commerce feed workflow.',
};

async function resolveSearchParams(
  searchParams?: SearchParamsInput | Promise<SearchParamsInput>,
): Promise<SearchParamsInput> {
  if (!searchParams) return {};
  return Promise.resolve(searchParams);
}

function firstParam(value: string | string[] | undefined) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] || '';
  return '';
}

async function getEditablePost(postId: string, userId: string, creatorId: string) {
  const post = await prisma.contentPost.findFirst({
    where: {
      id: postId,
      status: { not: 'DELETED' },
      OR: [{ authorUserId: userId }, { creatorProfileId: creatorId }],
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
  });

  return post ? serializeContentPost(post, userId) : null;
}

export default async function CreatorPostsNewPage({ searchParams }: PageProps) {
  const context = await getCurrentSessionUser();

  if (!context || context.user.role !== 'CREATOR') {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Creator Post Composer"
          description="Sign in as a creator to upload or edit vertical feed content."
          navItems={[...creatorNavItems]}
          currentPath="/creator/posts/new"
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
    select: {
      id: true,
      name: true,
      slug: true,
      roleLabel: true,
      imageUrl: true,
    },
  });

  if (!creator) {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Creator Post Composer"
          description="Your creator user is active, but no creator profile has been linked yet."
          navItems={[...creatorNavItems]}
          currentPath="/creator/posts/new"
        >
          <section className="card">
            <div className="section-kicker">Profile Not Linked</div>
            <h2 style={{ marginTop: 0 }}>Ask an admin to link your creator account.</h2>
            <p className="section-copy">
              The creator upload flow needs a linked creator profile so posts point to the correct public creator page and stay inside the current role-safe feed workflow.
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

  const params = await resolveSearchParams(searchParams);
  const editId = firstParam(params.edit || params.postId);
  const initialPost: FeedPost | null = editId
    ? await getEditablePost(editId, context.user.id, creator.id)
    : null;

  if (editId && !initialPost) {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Edit Creator Post"
          description="The requested creator post could not be found or is not available to your current session."
          navItems={[...creatorNavItems]}
          currentPath="/creator/posts/new"
        >
          <section className="card">
            <div className="notice error">Unable to load that creator post.</div>
            <p className="section-copy">
              The post may have been deleted, moved out of your creator profile, or blocked by the current role guard.
            </p>
            <div className="btn-row">
              <Link className="button-link" href="/creator/posts">Back to Creator Posts</Link>
              <Link className="button-link btn-secondary" href="/creator/posts/new">Open New Composer</Link>
            </div>
          </section>
        </RoleShell>
      </main>
    );
  }

  return (
    <main>
      <RoleShell
        roleLabel="Creator"
        title={initialPost ? 'Edit Creator Post' : 'New Creator Post'}
        description={
          initialPost
            ? 'Update creator media, captions, and visibility while keeping the post inside the Prisma-backed creator-commerce workflow.'
            : 'Upload vertical creator media to Cloudflare Stream, add caption and hashtags, then save it into the Prisma-backed creator-commerce feed workflow.'
        }
        navItems={[...creatorNavItems]}
        currentPath="/creator/posts/new"
      >
        <div className="btn-row" style={{ marginBottom: 18 }}>
          <Link className="button-link" href="/creator/posts">View All Feed Posts</Link>
          <Link className="button-link btn-secondary" href={`/creators/${creator.slug}`}>Open Public Profile</Link>
        </div>

        <CreatorPostComposer
          creatorId={creator.id}
          creatorDisplayName={creator.name}
          creatorSlug={creator.slug}
          creatorAvatar={creator.imageUrl}
          creatorRoleLabel={creator.roleLabel}
          redirectPath="/creator/posts"
          publicProfileHref={`/creators/${creator.slug}`}
          initialPost={initialPost}
        />
      </RoleShell>
    </main>
  );
}
