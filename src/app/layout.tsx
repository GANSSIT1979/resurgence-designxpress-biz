// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { buildSiteMetadata } from '@/lib/metadata';
import { getPublicSettings } from '@/lib/settings';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return buildSiteMetadata(settings);
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="site-main">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
