import Link from 'next/link';
import type { Metadata } from 'next';
import CreatorPostEditWorkspace from '@/components/resurgence/CreatorPostEditWorkspace';
import { RoleShell } from '@/components/role-shell';
import { canActorManageCreatorPost } from '@/lib/creator-posts/action-auth';
import { getCreatorActionPost } from '@/lib/creator-posts/action-posts';
import { creatorNavItems } from '@/lib/creators';
import { mapFeedPostToEditableRecord } from '@/lib/creator-posts/utils';
import { serializeContentPost } from '@/lib/feed/serializers';
import { prisma } from '@/lib/prisma';
import type { AppRole } from '@/lib/resurgence';
import { getCurrentSessionUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Creator Post | RESURGENCE Powered by DesignXpress',
  description: 'Edit creator captions, hashtags, visibility, and media metadata in the Prisma-backed creator studio.',
};

export default async function CreatorPostEditPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const context = await getCurrentSessionUser();

  if (!context || context.user.role !== 'CREATOR') {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Edit Creator Post"
          description="Sign in as a creator to edit creator feed content."
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
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!creator) {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Edit Creator Post"
          description="Your creator user is active, but no creator profile has been linked yet."
          navItems={[...creatorNavItems]}
          currentPath="/creator/posts"
        >
          <section className="card">
            <div className="section-kicker">Profile Not Linked</div>
            <h2 style={{ marginTop: 0 }}>Ask an admin to link your creator account.</h2>
            <p className="section-copy">
              The creator edit flow needs a linked creator profile so every post stays attached to the right public creator page and moderation workflow.
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

  const { postId } = await params;
  const rawPost = await getCreatorActionPost(postId);
  const actor = {
    id: context.user.id,
    role: context.user.role as AppRole,
    displayName: context.user.displayName,
  };

  if (!rawPost || !canActorManageCreatorPost(actor, rawPost)) {
    return (
      <main>
        <RoleShell
          roleLabel="Creator"
          title="Edit Creator Post"
          description="The requested creator post could not be found or is not available to your current session."
          navItems={[...creatorNavItems]}
          currentPath="/creator/posts"
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

  const editablePost = mapFeedPostToEditableRecord(serializeContentPost(rawPost, context.user.id));

  return (
    <main>
      <RoleShell
        roleLabel="Creator"
        title="Edit Creator Post"
        description="Update caption, hashtags, visibility, and media discovery metadata while keeping the post in the current creator review workflow."
        navItems={[...creatorNavItems]}
        currentPath="/creator/posts"
      >
        <div className="btn-row" style={{ marginBottom: 18 }}>
          <Link className="button-link" href="/creator/posts">Back to Creator Posts</Link>
          <Link className="button-link btn-secondary" href={`/creator/posts/new?edit=${encodeURIComponent(postId)}`}>Open Full Composer</Link>
          <Link className="button-link" href={`/creators/${creator.slug}`}>Open Public Profile</Link>
        </div>

        <CreatorPostEditWorkspace initialPost={editablePost} />
      </RoleShell>
    </main>
  );
}
