import { NextRequest } from 'next/server';
import { apiError } from './response';

// Minimal role guard – adapt to your auth/session implementation
export type Role = 'ADMIN' | 'STAFF' | 'MEMBER' | 'CREATOR' | 'PUBLIC' | 'SYSTEM';

export function getRoleFromRequest(_req: NextRequest): Role {
  // TODO: integrate with your JWT/session (e.g., read cookie and decode role)
  // Fallback to PUBLIC to be safe
  return 'PUBLIC';
}

export function requireRole(req: NextRequest, allowed: Role[]) {
  const role = getRoleFromRequest(req);
  if (!allowed.includes(role)) {
    return apiError('FORBIDDEN', 'Insufficient permissions', 403, { role, allowed });
  }
  return null;
}
