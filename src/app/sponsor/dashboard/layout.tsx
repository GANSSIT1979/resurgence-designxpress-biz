import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const links = [
  { href: "/sponsor/dashboard", label: "Overview" },
  { href: "/sponsor/dashboard/applications", label: "Applications" },
  { href: "/sponsor/dashboard/packages", label: "Packages" },
  { href: "/sponsor/dashboard/deliverables", label: "Deliverables" },
  { href: "/sponsor/dashboard/billing", label: "Billing" },
  { href: "/sponsor/dashboard/profile", label: "Profile" },
];

export default function SponsorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell
      title="Sponsor Portal"
      subtitle="Track sponsorship progress, package details, profile updates, deliverables, and billing visibility from one partner-facing workspace."
      links={links}
    >
      {children}
    </DashboardShell>
  );
}
