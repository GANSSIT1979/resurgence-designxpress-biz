"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppRole, roleMeta } from "@/lib/resurgence";

type HeaderUser = {
  email: string;
  role: AppRole;
  displayName?: string | null;
};

type AuthMeResponse = {
  user?: HeaderUser | null;
};

export function SiteHeaderAccountControls() {
  const pathname = usePathname();
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const payload = (await response.json().catch(() => null)) as AuthMeResponse | null;
        if (!active) return;

        setUser(response.ok ? payload?.user ?? null : null);
      } catch {
        if (!active) return;
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [pathname]);

  if (loading) {
    return (
      <div className="site-header-account site-header-account-loading" aria-hidden="true">
        <span className="site-header-account-skeleton" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link href="/login" className="nav-login-link">
        Log-in
      </Link>
    );
  }

  const role = roleMeta[user.role];
  const displayName = user.displayName?.trim() || role.label;

  return (
    <div className="site-header-account">
      <div className="site-header-account-meta">
        <span className="site-header-account-name" title={displayName}>
          {displayName}
        </span>
        <span className="site-header-account-role">{role.label}</span>
      </div>

      <div className="site-header-account-actions">
        <Link href={role.defaultRoute} className="nav-dashboard-link">
          Dashboard
        </Link>

        <form action="/api/auth/logout" className="nav-logout-form" method="post">
          <button className="nav-logout-button" type="submit">
            Log-out
          </button>
        </form>
      </div>
    </div>
  );
}
