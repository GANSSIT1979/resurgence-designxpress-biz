// src/app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="site-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}