export type SponsorPackageTier = {
  slug: string;
  name: string;
  badgeLabel: string;
  priceLabel: string;
  description: string;
  deliverables: string[];
  sortOrder: number;
  isCustom?: boolean;
};

export const FALLBACK_SPONSOR_PACKAGES: SponsorPackageTier[] = [
  {
    slug: 'supporting-sponsor',
    name: 'Supporting Sponsor',
    badgeLabel: 'Supporting Sponsor',
    priceLabel: 'PHP 15,000-50,000',
    description: 'Entry sponsorship tier designed for visibility, community support, and targeted activation value.',
    deliverables: [
      'Logo placement on selected event and digital assets',
      'Inclusion in sponsor recognition materials',
      'Visibility across select social and event mentions',
      'Access to structured grassroots brand exposure',
    ],
    sortOrder: 1,
  },
  {
    slug: 'official-brand-partner',
    name: 'Official Brand Partner',
    badgeLabel: 'Official Brand Partner',
    priceLabel: 'PHP 75,000-95,000',
    description: 'Mid-tier brand partnership with stronger digital integration and broader sponsorship positioning.',
    deliverables: [
      'Enhanced brand placement across sponsor-facing materials',
      'Digital integration across creator and campaign assets',
      'Expanded event visibility and partner callouts',
      'Priority inclusion in activation planning',
    ],
    sortOrder: 2,
  },
  {
    slug: 'major-partner',
    name: 'Major Partner',
    badgeLabel: 'Major Partner',
    priceLabel: 'PHP 120,000-150,000',
    description: 'High-impact partnership tier for brands seeking premium integration and strong commercial presence.',
    deliverables: [
      'Premium logo placement and sponsor positioning',
      'Expanded creator-network integration',
      'On-ground activation prioritization',
      'High-visibility commercial support and packaged deliverables',
    ],
    sortOrder: 3,
  },
  {
    slug: 'event-presenting',
    name: 'Event Presenting',
    badgeLabel: 'Event Presenting',
    priceLabel: 'Custom Proposal',
    description: 'Custom presenting package for lead brands seeking headline integration and tailored sponsorship rights.',
    deliverables: [
      'Custom proposal structure based on event or campaign scale',
      'Presenting-level brand integration',
      'Priority negotiation on activations and deck placement',
      'Tailored deliverables, branding, and commercial support',
    ],
    sortOrder: 4,
    isCustom: true,
  },
];

export function normalizeSponsorPackageTemplate(template: any): SponsorPackageTier {
  const min = template.priceMin ?? template.minPrice ?? template.startingPrice ?? null;
  const max = template.priceMax ?? template.maxPrice ?? null;
  const priceLabel = template.priceLabel || (min && max ? `PHP ${Number(min).toLocaleString()}-${Number(max).toLocaleString()}` : min ? `PHP ${Number(min).toLocaleString()}+` : 'Custom Proposal');

  const deliverables = Array.isArray(template.deliverables)
    ? template.deliverables
    : typeof template.deliverables === 'string'
      ? template.deliverables.split('\n').map((item: string) => item.trim()).filter(Boolean)
      : [];

  return {
    slug: template.slug || template.id,
    name: template.name || template.title || 'Sponsor Package',
    badgeLabel: template.badgeLabel || template.name || 'Sponsor Package',
    priceLabel,
    description: template.description || 'Sponsor package configured in the admin CMS.',
    deliverables: deliverables.length ? deliverables : ['Configured package deliverables available in admin CMS.'],
    sortOrder: template.sortOrder ?? 999,
    isCustom: Boolean(template.isCustom),
  };
}

export function resolveSponsorPackages(templates?: any[] | null) {
  if (!templates?.length) return FALLBACK_SPONSOR_PACKAGES;
  return templates.map(normalizeSponsorPackageTemplate).sort((a, b) => a.sortOrder - b.sortOrder);
}
