import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sponsor-submissions", label: "Submissions" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/creator-network", label: "Creators" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/products-services", label: "Products & Services" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      title="System Admin Dashboard"
      subtitle="Oversee sponsorship operations, content modules, creator assets, user access, and business workflows from one command surface."
      links={links}
    >
      {children}
    </DashboardShell>
  );
}
