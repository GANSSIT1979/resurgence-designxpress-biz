import { CommunityDashboardShell } from '@/components/community-dashboard-shell';

export const dynamic = 'force-dynamic';

export default function MemberDashboardPage() {
  return (
    <CommunityDashboardShell
      role="MEMBER"
      eyebrow="Regular Member Dashboard"
      title="Welcome to the Resurgence community."
      description="Your free member account gives you a simple home base for merch, creator updates, events, and community announcements."
      cards={[
        { title: 'Community Updates', body: 'Follow Resurgence news, creator drops, event announcements, and sponsor-supported community activity.' },
        { title: 'Official Merch', body: 'Browse official Resurgence merch and member-ready drops from the shop.', href: '/shop', cta: 'Shop merch' },
        { title: 'Creators', body: 'Discover Resurgence creators, basketball personalities, coaches, and sponsor-ready profiles.', href: '/creators', cta: 'View creators' },
      ]}
    />
  );
}
