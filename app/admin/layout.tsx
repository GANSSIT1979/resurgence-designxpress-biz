import { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sponsor-submissions", label: "Sponsor Submissions" },
  { href: "/admin/sponsor-packages", label: "Sponsor Packages" },
  { href: "/admin/creator-network", label: "Creator Network" },
  { href: "/admin/sponsor-inventory", label: "Sponsor Inventory" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/content", label: "Content CMS" },
  { href: "/admin/products-services", label: "Product and Services" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/users", label: "Users and Roles" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardShell title="System Admin" links={links}>{children}</DashboardShell>;
}
