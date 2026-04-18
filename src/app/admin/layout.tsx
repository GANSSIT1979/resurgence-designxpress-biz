import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sponsor-submissions", label: "Applications" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      title="System Admin Dashboard"
      subtitle="Oversee sponsorship operations, content modules, creator assets, inquiry flow, and business workflows from one command surface."
      links={links}
    >
      {children}
    </DashboardShell>
  );
}
