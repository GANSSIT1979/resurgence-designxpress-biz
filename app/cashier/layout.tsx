import { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const links = [
  { href: "/cashier", label: "Overview" },
  { href: "/cashier/invoices", label: "Invoices" },
  { href: "/cashier/transactions", label: "Transactions" },
  { href: "/cashier/receipts", label: "Receipts" },
  { href: "/cashier/reports", label: "Reports" }
];

export default function CashierLayout({ children }: { children: ReactNode }) {
  return <DashboardShell title="Cashier" links={links}>{children}</DashboardShell>;
}
