import { CommunityDashboardShell } from '@/components/community-dashboard-shell';

export const dynamic = 'force-dynamic';

export default function RefereeDashboardPage() {
  return (
    <CommunityDashboardShell
      role="REFEREE"
      eyebrow="Referee Dashboard"
      title="Game-ready officiating access."
      description="Your free referee account gives officials a home base for availability, event readiness, and future assignment coordination."
      cards={[
        { title: 'Official Profile', body: 'Prepare your officiating details, location, availability, and basketball event experience.' },
        { title: 'Event Readiness', body: 'Stay connected with Resurgence activities and future referee coordination workflows.' },
        { title: 'Contact Operations', body: 'Share your referee credentials or availability with the operations team.', href: '/contact', cta: 'Contact operations' },
      ]}
    />
  );
}
