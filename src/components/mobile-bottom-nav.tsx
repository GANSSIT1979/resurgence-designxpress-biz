'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppRole, roleMeta } from '@/lib/resurgence';

type HeaderUser = {
  email: string;
  role: AppRole;
  displayName?: string | null;
};

type AuthMeResponse = {
  user?: HeaderUser | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: string;
  active: boolean;
};

function resolveDashboardRoute(role?: AppRole | null) {
  if (!role) return '/login';
  return roleMeta[role].defaultRoute;
}

function resolveCreateRoute(role?: AppRole | null) {
  if (role === 'CREATOR' || role === 'SYSTEM_ADMIN' || role === 'STAFF') return '/creator/posts';
  return '/login?next=%2Fcreator%2Fposts';
}

function resolveInboxRoute(role?: AppRole | null) {
  if (!role) return '/login';
  if (role === 'MEMBER' || role === 'SYSTEM_ADMIN') return '/member#notifications';
  return roleMeta[role].defaultRoute;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<HeaderUser | null>(null);
  const hiddenPrefixes = ['/admin', '/cashier', '/sponsor', '/staff', '/partner', '/creator/dashboard', '/creator/posts', '/coach', '/referee'];

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        });

        const payload = (await response.json().catch(() => null)) as AuthMeResponse | null;
        if (!active) return;
        setUser(response.ok ? payload?.user ?? null : null);
      } catch {
        if (!active) return;
        setUser(null);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [pathname]);

  const dashboardRoute = resolveDashboardRoute(user?.role);
  const inboxRoute = resolveInboxRoute(user?.role);
  const createRoute = resolveCreateRoute(user?.role);

  if (hiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  const items: NavItem[] = [
    { href: '/', label: 'Home', icon: '01', active: pathname === '/' },
    { href: '/feed', label: 'Discover', icon: '02', active: pathname === '/feed' || pathname.startsWith('/creators') },
    { href: createRoute, label: 'Create', icon: '03', active: pathname.startsWith('/creator/posts') },
    { href: inboxRoute, label: 'Inbox', icon: '04', active: pathname.startsWith('/member') || pathname.startsWith('/support') },
    { href: dashboardRoute, label: 'Profile', icon: '05', active: pathname === dashboardRoute || pathname.startsWith(`${dashboardRoute}/`) },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
      {items.map((item) => (
        <Link className={item.active ? 'active' : undefined} href={item.href} key={`${item.label}-${item.href}`}>
          <span>{item.icon}</span>
          <strong>{item.label}</strong>
        </Link>
      ))}
    </nav>
  );
}
