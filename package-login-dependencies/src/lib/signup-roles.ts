export const publicSignupRoles = ['MEMBER', 'CREATOR', 'COACH', 'REFEREE', 'SPONSOR', 'PARTNER'] as const;
export type PublicSignupRole = (typeof publicSignupRoles)[number];

export const publicSignupRoleCards: Array<{
  role: PublicSignupRole;
  title: string;
  description: string;
  highlight: string;
}> = [
  {
    role: 'MEMBER',
    title: 'Regular Member',
    description: 'Join the Resurgence community, follow events, shop merch, and unlock member updates.',
    highlight: 'Free community access',
  },
  {
    role: 'CREATOR',
    title: 'Creator',
    description: 'Build a sponsor-ready creator profile with links, social reach, and public presentation.',
    highlight: 'Creator profile tools',
  },
  {
    role: 'COACH',
    title: 'Coach',
    description: 'Represent basketball development, training programs, player mentorship, and team leadership.',
    highlight: 'Coaching workspace',
  },
  {
    role: 'REFEREE',
    title: 'Referee',
    description: 'Support officiating coordination, game readiness, availability, and event assignments.',
    highlight: 'Officials hub',
  },
  {
    role: 'SPONSOR',
    title: 'Sponsor',
    description: 'Explore sponsorship applications, deliverables, billing references, and brand visibility.',
    highlight: 'Brand partner access',
  },
  {
    role: 'PARTNER',
    title: 'Partner',
    description: 'Coordinate referrals, partner campaigns, agreements, and collaborative opportunities.',
    highlight: 'Partnership portal',
  },
];
