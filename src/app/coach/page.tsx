import { CommunityDashboardShell } from '@/components/community-dashboard-shell';

export const dynamic = 'force-dynamic';

export default function CoachDashboardPage() {
  return (
    <CommunityDashboardShell
      role="COACH"
      eyebrow="Coach Dashboard"
      title="Coach leadership starts here."
      description="Your free coach account is built for basketball development, training visibility, community leadership, and future team/event coordination."
      cards={[
        { title: 'Training Profile', body: 'Prepare your coaching identity, specialty, experience, and development focus for future profile tools.' },
        { title: 'Community Pathway', body: 'Connect with Resurgence events, creators, athletes, sponsors, and grassroots basketball opportunities.' },
        { title: 'Support Desk', body: 'Need your coach profile completed by admin? Send details to the Resurgence support team.', href: '/contact', cta: 'Send details' },
      ]}
    />
  );
}
