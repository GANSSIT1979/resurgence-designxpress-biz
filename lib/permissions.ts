import { Role } from "@prisma/client";

export const ROUTE_ROLE_MAP: Record<string, Role[]> = {
  "/admin": [Role.SYSTEM_ADMIN],
  "/cashier": [Role.CASHIER, Role.SYSTEM_ADMIN],
  "/sponsor": [Role.SPONSOR, Role.SYSTEM_ADMIN],
  "/staff": [Role.STAFF, Role.SYSTEM_ADMIN],
  "/partner": [Role.PARTNER, Role.SYSTEM_ADMIN]
};

export function hasRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export function canAccessPath(pathname: string, role: Role) {
  for (const [prefix, roles] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname.startsWith(prefix)) {
      return hasRole(role, roles);
    }
  }
  return true;
}
