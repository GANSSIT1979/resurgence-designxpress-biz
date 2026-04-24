export type ShareActor = {
  userId: string
  role: string
}

const CREATOR_ROLES = new Set(['CREATOR', 'SYSTEM_ADMIN', 'STAFF', 'SPONSOR', 'PARTNER'])

export function getShareActorFromHeaders(headers: Headers): ShareActor | null {
  const userId = headers.get('x-user-id')?.trim()
  const role = headers.get('x-user-role')?.trim()

  if (!userId || !role) return null
  return { userId, role }
}

export function assertCanCreateShareToken(actor: ShareActor | null) {
  if (!actor) {
    return { ok: false as const, status: 401, message: 'Unauthorized.' }
  }

  if (!CREATOR_ROLES.has(actor.role)) {
    return { ok: false as const, status: 403, message: 'Forbidden.' }
  }

  return { ok: true as const }
}

export function assertCanReadSponsorSummary(actor: ShareActor | null) {
  if (!actor) {
    return { ok: false as const, status: 401, message: 'Unauthorized.' }
  }

  if (!CREATOR_ROLES.has(actor.role)) {
    return { ok: false as const, status: 403, message: 'Forbidden.' }
  }

  return { ok: true as const }
}
