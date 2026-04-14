import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const links = [
  { href: "/cashier", label: "Overview" },
  { href: "/cashier/invoices", label: "Invoices" },
  { href: "/cashier/transactions", label: "Transactions" },
  { href: "/cashier/receipts", label: "Receipts" },
  { href: "/cashier/reports", label: "Reports" },
];

export default function CashierLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      title="Cashier Dashboard"
      subtitle="Manage invoices, receipts, collections, adjustments, and financial visibility with a cleaner executive workflow."
      links={links}
    >
      {children}
    </DashboardShell>
  );
}
