import type { PublicSettings } from '@/lib/settings';

export type SupportCategory = {
  key: 'sponsorships' | 'events' | 'custom-apparel' | 'partnerships';
  label: string;
  routeLabel: string;
  starterPrompt: string;
  summary: string;
};

export const supportCategories: readonly SupportCategory[] = [
  {
    key: 'sponsorships',
    label: 'Sponsorships',
    routeLabel: 'Sponsor package and brand activation routing',
    starterPrompt: 'I want to ask about sponsor packages and brand activation opportunities.',
    summary: 'Package tiers, deck-aligned sponsor benefits, creator integrations, and commercial follow-up.',
  },
  {
    key: 'events',
    label: 'Events',
    routeLabel: 'League and event support routing',
    starterPrompt: 'I need help with league operations, event booking, or activation support.',
    summary: 'League/event booking, on-ground activation, schedules, and event requirements.',
  },
  {
    key: 'custom-apparel',
    label: 'Custom Apparel',
    routeLabel: 'Uniform and custom apparel routing',
    starterPrompt: 'I need a quote for custom uniforms or apparel production.',
    summary: 'Custom jerseys, uniforms, apparel orders, production details, and quotation handoff.',
  },
  {
    key: 'partnerships',
    label: 'Partnerships',
    routeLabel: 'Partner and collaboration routing',
    starterPrompt: 'I want to explore a media or brand partnership with RESURGENCE.',
    summary: 'Media, co-branding, creator partnerships, and long-term collaboration conversations.',
  },
] as const;

export const supportWorkflowPrompt = `You are the official customer service assistant for RESURGENCE Powered by DesignXpress.

Your scope:
- Sponsorship packages, creator-led integrations, activations, and commercial sponsor questions.
- Event operations, leagues, bookings, and on-ground support.
- Custom uniforms, jerseys, and apparel requests.
- Media, brand, and strategic partnerships.

Routing rules:
- For sponsorship questions, explain available sponsor package directions at a high level and route serious leads to the inquiry form for formal follow-up.
- For events, clarify the event type, expected audience, venue/date needs, and operational scope before handing off.
- For custom apparel, collect quantity, timeline, sizing, design needs, and preferred contact details before handoff.
- For partnerships, determine whether the user is asking about media, community, brand, creator, or commercial collaboration and route accordingly.

Operating rules:
- Stay concise, professional, premium, and brand-safe.
- Never invent prices, terms, inventory, or commitments that are not confirmed in the site or workflow context.
- When an inquiry becomes commercial, operational, or requires approval, ask for the visitor's full name, organization, email, phone number, and the exact help they need.
- Encourage serious leads to submit the inquiry form on the support page for formal follow-up.
- If unsure, clearly say that a human team member will confirm the details.`;

export function getSupportRouteStatus() {
  const apiKeyConfigured = Boolean(process.env.OPENAI_API_KEY);
  const workflowIdConfigured = Boolean(process.env.OPENAI_WORKFLOW_ID);
  const workflowVersionConfigured = Boolean(process.env.OPENAI_WORKFLOW_VERSION);
  const webhookSecretConfigured = Boolean(process.env.OPENAI_WEBHOOK_SECRET);

  return {
    apiKeyConfigured,
    workflowIdConfigured,
    workflowVersionConfigured,
    webhookSecretConfigured,
    chatkitReady: apiKeyConfigured && workflowIdConfigured,
    webhookReady: webhookSecretConfigured,
    missing: [
      !apiKeyConfigured ? 'OPENAI_API_KEY' : null,
      !workflowIdConfigured ? 'OPENAI_WORKFLOW_ID' : null,
      !webhookSecretConfigured ? 'OPENAI_WEBHOOK_SECRET' : null,
    ].filter(Boolean) as string[],
  };
}

export function buildSupportWorkflowStateVariables(settings: PublicSettings) {
  return {
    company_name: 'RESURGENCE Powered by DesignXpress',
    contact_name: settings.contactName,
    contact_email: settings.contactEmail,
    contact_phone: settings.contactPhone,
    support_form_url: '/support',
    support_topics: supportCategories.map((item) => item.label).join(' | '),
    route_sponsorships: supportCategories[0].routeLabel,
    route_events: supportCategories[1].routeLabel,
    route_apparel: supportCategories[2].routeLabel,
    route_partnerships: supportCategories[3].routeLabel,
  };
}

