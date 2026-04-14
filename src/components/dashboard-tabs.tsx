"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardTab = {
  href: string;
  label: string;
  exact?: boolean;
  count?: number | string;
};

type DashboardTabsProps = {
  tabs: DashboardTab[];
};

export function DashboardTabs({ tabs }: DashboardTabsProps) {
  const pathname = usePathname();

  return (
    <nav className="dashboard-tabs" aria-label="Dashboard tabs">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`dashboard-tab${active ? " dashboard-tab-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined ? (
              <span className="dashboard-tab-count">{tab.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
