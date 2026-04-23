import Link from 'next/link';
import type { Metadata } from 'next';
import CreatorPostComposer from '@/components/resurgence/CreatorPostComposer';
import { RoleShell } from '@/components/role-shell';
import { creatorNavItems } from '@/lib/creators';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'New Creator Post | RESURGENCE Powered by DesignXpress',
  description: 'Upload a creator video to Cloudflare Stream and save it into the creator-commerce feed workflow.',
};

export default async function CreatorPostsNewPage() {
  const context = await getCurrentSessionUser();

  if (!context || context.user.role !== 'CREATOR') {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="New Creator Post"
          description="Sign in as a creator to upload and save vertical feed content."
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
          title="New Creator Post"
          description="Your creator user is active, but no creator profile has been linked yet."
          navItems={[...creatorNavItems]}
          currentPath="/creator/posts/new"
        >
          <section className="card">
            <div className="section-kicker">Profile Not Linked</div>
            <h2 style={{ marginTop: 0 }}>Ask an admin to link your creator account.</h2>
            <p className="section-copy">
              The creator upload flow needs a linked creator profile so new posts point to the correct public creator page and stay inside the current role-safe feed workflow.
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

  return (
    <main>
      <RoleShell
        roleLabel="Creator"
        title="New Creator Post"
        description="Upload vertical creator media to Cloudflare Stream, add caption and hashtags, then save it into the Prisma-backed creator-commerce feed workflow."
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
        />
      </RoleShell>
    </main>
  );
}
