import type { NextRequest } from 'next/server';
import { fail } from '@/lib/api-utils';
import { getApiUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import type { AppRole } from '@/lib/resurgence';
import type { CreatorAnalyticsActor } from '@/lib/creator-analytics-api/types';

type CreatorAnalyticsTarget = {
  id: string;
  name: string;
  slug: string;
  userId: string | null;
};

const CREATOR_ANALYTICS_ROLES: readonly AppRole[] = [
  'CREATOR',
  'STAFF',
  'SYSTEM_ADMIN',
];

const SPONSOR_SAFE_ANALYTICS_ROLES: readonly AppRole[] = [
  'CREATOR',
  'SPONSOR',
  'PARTNER',
  'STAFF',
  'SYSTEM_ADMIN',
];

async function loadLinkedCreatorProfile(userId: string) {
  return prisma.creatorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

async function buildActor(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) {
    return { actor: null, error: fail('Unauthorized. Please log in first.', 401) };
  }

  const creatorProfile = await loadLinkedCreatorProfile(user.id);

  const actor: CreatorAnalyticsActor = {
    userId: user.id,
    role: user.role,
    email: user.email,
    displayName: user.displayName,
    creatorProfileId: creatorProfile?.id ?? null,
    sponsorProfileId: user.sponsorProfileId,
    partnerProfileId: user.partnerProfileId,
  };

  return { actor, error: null };
}

function hasAllowedRole(role: CreatorAnalyticsActor['role'], allowedRoles: readonly AppRole[]) {
  return allowedRoles.includes(role as AppRole);
}

export async function requireCreatorAnalyticsActor(request: NextRequest) {
  const result = await buildActor(request);
  if (result.error || !result.actor) return result;

  if (!hasAllowedRole(result.actor.role, CREATOR_ANALYTICS_ROLES)) {
    return {
      actor: null,
      error: fail(
        'Forbidden. Creator analytics are limited to creators, staff, and system admins.',
        403,
      ),
    };
  }

  return result;
}

export async function requireSponsorSafeAnalyticsActor(request: NextRequest) {
  const result = await buildActor(request);
  if (result.error || !result.actor) return result;

  if (!hasAllowedRole(result.actor.role, SPONSOR_SAFE_ANALYTICS_ROLES)) {
    return {
      actor: null,
      error: fail(
        'Forbidden. Sponsor-safe analytics are limited to creators, sponsors, partners, staff, and system admins.',
        403,
      ),
    };
  }

  return result;
}

export async function getCreatorAnalyticsTarget(creatorId: string) {
  const target = await prisma.creatorProfile.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      name: true,
      slug: true,
      userId: true,
    },
  });

  if (!target) {
    return { target: null, error: fail('Creator profile not found.', 404) };
  }

  return {
    target: target as CreatorAnalyticsTarget,
    error: null,
  };
}

export function canActorReadCreatorAnalytics(
  actor: CreatorAnalyticsActor,
  creatorId: string,
) {
  if (actor.role === 'SYSTEM_ADMIN' || actor.role === 'STAFF') return true;
  if (actor.role === 'CREATOR') return actor.creatorProfileId === creatorId;
  return false;
}

export function canActorReadSponsorSafeAnalytics(
  actor: CreatorAnalyticsActor,
  creatorId: string,
) {
  if (
    actor.role === 'SYSTEM_ADMIN' ||
    actor.role === 'STAFF' ||
    actor.role === 'SPONSOR' ||
    actor.role === 'PARTNER'
  ) {
    return true;
  }

  if (actor.role === 'CREATOR') return actor.creatorProfileId === creatorId;
  return false;
}
