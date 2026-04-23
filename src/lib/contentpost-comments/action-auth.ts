import { NextRequest } from 'next/server';
import { fail } from '@/lib/api-utils';
import { getApiUser } from '@/lib/auth-server';
import { AppRole } from '@/lib/resurgence';

export type CommentActor = {
  id: string;
  role: AppRole;
  displayName: string;
};

export async function getOptionalCommentActor(request: NextRequest): Promise<CommentActor | null> {
  const user = await getApiUser(request);
  if (!user) return null;

  return {
    id: user.id,
    role: user.role as AppRole,
    displayName: user.displayName,
  };
}

export async function requireCommentActor(request: NextRequest) {
  const actor = await getOptionalCommentActor(request);
  if (!actor) {
    return { actor: null, error: fail('Unauthorized. Please log in first.', 401) };
  }

  return { actor, error: null };
}
