import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "RESURGENCE Powered by DesignXpress",
    template: "%s | RESURGENCE Powered by DesignXpress",
  },
  description: "Deployable full-stack sponsorship, creator network, gallery, sponsor inventory, and cashier platform.",
  applicationName: "RESURGENCE Powered by DesignXpress",
  keywords: [
    "Resurgence",
    "DesignXpress",
    "basketball sponsorship",
    "creator network",
    "sports business platform",
  ],
  icons: {
    icon: "/uploads/resurgence-logo.jpg",
    shortcut: "/uploads/resurgence-logo.jpg",
    apple: "/uploads/resurgence-logo.jpg",
  },
  openGraph: {
    title: "RESURGENCE Powered by DesignXpress",
    description: "Premium sports-business platform for sponsorships, creator activations, gallery storytelling, and operations.",
    images: ["/uploads/resurgence-logo.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteHeader />
        <main className="site-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
