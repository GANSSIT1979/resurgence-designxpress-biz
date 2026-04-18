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

export const supportWorkflowPrompt = `You are the official customer service assistant for Resurgence Powered by DesignXpress, operated by DesignXpress Merchandising OPC.

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
- Use the sponsorship and partnership contact for commercial conversations, and the support desk contact for general support questions.
- Encourage serious leads to submit the inquiry form on the support page for formal follow-up.
- If unsure, clearly say that a human team member will confirm the details.`;

type SupportConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ResponsesApiPayload = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

function hasConfiguredValue(value?: string | null) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return false;
  }

  return !/^(your_|wf_your_|whsec_your_|change-this|replace-this|example_)/i.test(normalized);
}

function getSupportPromptConfig() {
  const promptId = (process.env.OPENAI_PROMPT_ID || process.env.OPENAI_WORKFLOW_ID || '').trim();
  const promptVersion = (process.env.OPENAI_PROMPT_VERSION || process.env.OPENAI_WORKFLOW_VERSION || '').trim();

  return {
    promptId,
    promptVersion,
    promptIdConfigured: hasConfiguredValue(promptId),
    promptVersionConfigured: hasConfiguredValue(promptVersion),
  };
}

export function getSupportRouteStatus() {
  const apiKeyConfigured = hasConfiguredValue(process.env.OPENAI_API_KEY);
  const { promptIdConfigured, promptVersionConfigured } = getSupportPromptConfig();
  const webhookSecretConfigured = hasConfiguredValue(process.env.OPENAI_WEBHOOK_SECRET);

  return {
    apiKeyConfigured,
    workflowIdConfigured: promptIdConfigured,
    workflowVersionConfigured: promptVersionConfigured,
    promptIdConfigured,
    promptVersionConfigured,
    webhookSecretConfigured,
    chatkitReady: apiKeyConfigured && promptIdConfigured,
    webhookReady: webhookSecretConfigured,
    missing: [
      !apiKeyConfigured ? 'OPENAI_API_KEY' : null,
      !promptIdConfigured ? 'OPENAI_PROMPT_ID (or OPENAI_WORKFLOW_ID)' : null,
      !webhookSecretConfigured ? 'OPENAI_WEBHOOK_SECRET' : null,
    ].filter(Boolean) as string[],
  };
}

export function getSupportCategory(key?: string | null) {
  return supportCategories.find((item) => item.key === key) || supportCategories[0];
}

export function inferSupportCategory(message: string): SupportCategory['key'] {
  const normalized = message.toLowerCase();

  if (/(uniform|jersey|apparel|merch|merchandise|printing|sublimation|dtf)/.test(normalized)) {
    return 'custom-apparel';
  }

  if (/(event|league|tournament|booking|activation|venue|clinic)/.test(normalized)) {
    return 'events';
  }

  if (/(partner|partnership|media|collaboration|co-brand|alliance)/.test(normalized)) {
    return 'partnerships';
  }

  return 'sponsorships';
}

export function buildSupportWorkflowStateVariables(settings: PublicSettings) {
  const supportFormUrl = settings.siteUrl.replace(/\/+$/, '') + '/support';

  return {
    brand_name: settings.brandName,
    company_name: settings.companyName,
    site_url: settings.siteUrl,
    contact_name: settings.contactName,
    contact_role: settings.contactRole,
    contact_email: settings.contactEmail,
    contact_phone: settings.contactPhone,
    support_email: settings.supportEmail,
    support_phone: settings.supportPhone,
    business_hours: settings.businessHours,
    location: settings.location,
    currency: settings.currency,
    payment_methods: settings.paymentMethods,
    shipping_area: settings.shippingArea,
    support_form_url: supportFormUrl,
    support_topics: supportCategories.map((item) => item.label).join(' | '),
    route_sponsorships: supportCategories[0].routeLabel,
    route_events: supportCategories[1].routeLabel,
    route_apparel: supportCategories[2].routeLabel,
    route_partnerships: supportCategories[3].routeLabel,
  };
}

function buildTranscriptInput(history: SupportConversationMessage[], message: string) {
  return [
    ...history.map((item) => ({
      role: item.role,
      content: [
        {
          type: 'input_text' as const,
          text: item.content,
        },
      ],
    })),
    {
      role: 'user' as const,
      content: [
        {
          type: 'input_text' as const,
          text: message,
        },
      ],
    },
  ];
}

function extractResponseText(payload: ResponsesApiPayload) {
  if (!Array.isArray(payload.output)) {
    return '';
  }

  return payload.output
    .flatMap((item) => {
      if (item.type !== 'message' || !Array.isArray(item.content)) {
        return [];
      }

      return item.content;
    })
    .map((item) => {
      if (item.type !== 'output_text' && item.type !== 'text') {
        return '';
      }

      return item.text || '';
    })
    .join('\n')
    .trim();
}

export async function generateSupportResponse(args: {
  conversationId: string;
  history: SupportConversationMessage[];
  message: string;
  route: SupportCategory;
  settings: PublicSettings;
}) {
  const status = getSupportRouteStatus();
  const { promptId, promptVersion } = getSupportPromptConfig();

  if (!status.chatkitReady || !promptId) {
    return null;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: {
        id: promptId,
        ...(promptVersion ? { version: promptVersion } : {}),
        variables: {
          ...buildSupportWorkflowStateVariables(args.settings),
          support_category: args.route.label,
          support_route_key: args.route.key,
          support_route_summary: args.route.summary,
        },
      },
      input: buildTranscriptInput(args.history, args.message),
      metadata: {
        conversationId: args.conversationId,
        supportRoute: args.route.key,
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as ResponsesApiPayload | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI Responses API request failed.');
  }

  return payload ? extractResponseText(payload) || null : null;
}
