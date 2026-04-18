import type { PublicSettings } from "@/lib/settings";

export type SupportRouteKey =
  | "sponsorships"
  | "events"
  | "custom-apparel"
  | "partnerships"
  | "general";

export type SupportCategory = {
  key: SupportRouteKey;
  label: string;
  description: string;
  routingHint: string;
  starterPrompt: string;
  keywords: string[];
};

export const supportCategories: SupportCategory[] = [
  {
    key: "sponsorships",
    label: "Sponsorships",
    description: "Deck-aligned sponsor packages, brand placements, and proposal follow-up.",
    routingHint: "Route this to sponsor packages, inventory, and brand activation follow-up.",
    starterPrompt:
      "I want to ask about RESURGENCE sponsorship packages and what brand exposure is available.",
    keywords: [
      "sponsor",
      "sponsorship",
      "package",
      "proposal",
      "brand partner",
      "major partner",
      "presenting",
      "deck",
      "activation",
      "inventory",
      "brand exposure",
      "official brand",
    ],
  },
  {
    key: "events",
    label: "Events",
    description: "League bookings, activations, clinics, and basketball event coordination.",
    routingHint: "Route this to event support, league coordination, bookings, or activations.",
    starterPrompt:
      "We want to collaborate on a basketball event and need booking or activation details.",
    keywords: [
      "event",
      "events",
      "league",
      "tournament",
      "game",
      "clinic",
      "booking",
      "activation",
      "on-ground",
      "schedule",
      "venue",
      "booth",
    ],
  },
  {
    key: "custom-apparel",
    label: "Custom Apparel",
    description: "Uniforms, jerseys, merch, and custom apparel production requests.",
    routingHint: "Route this to custom apparel production and order follow-up.",
    starterPrompt:
      "We need custom jerseys or uniforms and want to ask about design, pricing, and turnaround.",
    keywords: [
      "jersey",
      "jerseys",
      "uniform",
      "uniforms",
      "apparel",
      "merch",
      "merchandise",
      "shirt",
      "shirts",
      "sublimation",
      "custom order",
      "printing",
    ],
  },
  {
    key: "partnerships",
    label: "Partnerships",
    description: "Brand, media, creator, and business collaboration inquiries.",
    routingHint: "Route this to the partnership, creator, or media collaboration team.",
    starterPrompt:
      "We want to explore a partnership with RESURGENCE and need to know the right next steps.",
    keywords: [
      "partner",
      "partnership",
      "collaboration",
      "collab",
      "creator",
      "media",
      "ambassador",
      "affiliate",
      "co-brand",
      "co brand",
      "network",
      "strategic",
    ],
  },
  {
    key: "general",
    label: "General Support",
    description: "General support, follow-up, and human handoff when no routing match is clear.",
    routingHint: "Handle as a general inquiry and offer a human follow-up if needed.",
    starterPrompt: "I need help and I'm not sure which RESURGENCE service is the right fit.",
    keywords: [],
  },
];

export const supportVerificationScenarios = supportCategories.filter(
  (category) => category.key !== "general",
);

export const supportWorkflowPrompt = `You are the official customer service assistant for RESURGENCE Powered by DesignXpress.

Primary support lanes:
- Sponsorships
- Events
- Custom Apparel
- Partnerships

Required behavior:
- Answer the visitor's question clearly before asking for contact details.
- Keep the tone premium, sports-focused, and commercially helpful.
- Do not invent unavailable pricing, schedules, approvals, deliverables, or commitments.
- When business intent is clear, route the conversation toward the correct support lane.
- If the visitor wants a quote, proposal, formal follow-up, or meeting, ask for full name, organization, email, mobile number, and a short summary of the need.
- If the request is unclear, help narrow it to one of the four support lanes before escalating.

Known sponsorship package anchors:
- Supporting Sponsor: PHP 15,000-50,000
- Official Brand Partner: PHP 75,000-95,000
- Major Partner: PHP 120,000-150,000
- Event Presenting: Custom Proposal

Routing expectations:
- Sponsorships: packages, brand visibility, inventory, activations, proposals
- Events: league bookings, basketball events, clinics, on-ground activations
- Custom Apparel: jerseys, uniforms, merch, design, production
- Partnerships: creator, media, strategic, and business collaborations`;

const supportCategoryMap = new Map(
  supportCategories.map((category) => [category.key, category]),
);

export function getSupportCategory(key: SupportRouteKey | string): SupportCategory {
  return supportCategoryMap.get(key as SupportRouteKey) ?? supportCategoryMap.get("general")!;
}

export function inferSupportCategory(message: string): SupportRouteKey {
  const normalized = message.trim().toLowerCase();

  if (!normalized) return "general";

  let winner: SupportRouteKey = "general";
  let topScore = 0;

  for (const category of supportVerificationScenarios) {
    const score = category.keywords.reduce((total, keyword) => {
      return total + (normalized.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > topScore) {
      winner = category.key;
      topScore = score;
    }
  }

  return winner;
}

export function getSupportRouteStatus() {
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasWorkflowId = Boolean(process.env.OPENAI_WORKFLOW_ID?.trim());
  const hasWorkflowVersion = Boolean(process.env.OPENAI_WORKFLOW_VERSION?.trim());
  const hasWebhookSecret = Boolean(process.env.OPENAI_WEBHOOK_SECRET?.trim());

  const missing = [
    !hasOpenAIKey ? "OPENAI_API_KEY" : null,
    !hasWorkflowId ? "OPENAI_WORKFLOW_ID" : null,
    !hasWebhookSecret ? "OPENAI_WEBHOOK_SECRET" : null,
  ].filter((value): value is string => Boolean(value));

  return {
    hasOpenAIKey,
    hasWorkflowId,
    hasWorkflowVersion,
    hasWebhookSecret,
    chatkitReady: hasOpenAIKey && hasWorkflowId,
    webhookReady: hasOpenAIKey && hasWebhookSecret,
    productionReady: hasOpenAIKey && hasWorkflowId && hasWebhookSecret,
    missing,
  };
}

export function buildSupportWorkflowStateVariables(settings: PublicSettings) {
  return {
    company_name: "RESURGENCE Powered by DesignXpress",
    contact_name: settings.contactName,
    contact_email: settings.contactEmail,
    contact_phone: settings.contactPhone,
    contact_address: settings.contactAddress,
    sponsorship_route: "Sponsorship packages, proposals, activations, and inventory",
    event_route: "Basketball events, leagues, clinics, bookings, and activations",
    apparel_route: "Custom jerseys, uniforms, merch, and apparel production",
    partnership_route: "Creator, media, and business partnerships",
    sponsorship_tier_1: "Supporting Sponsor PHP 15,000-50,000",
    sponsorship_tier_2: "Official Brand Partner PHP 75,000-95,000",
    sponsorship_tier_3: "Major Partner PHP 120,000-150,000",
    sponsorship_tier_4: "Event Presenting Custom Proposal",
  } satisfies Record<string, string | boolean | number>;
}

export function buildSupportAgentInstructions(input: {
  leadCaptured: boolean;
  routeKey: SupportRouteKey;
  settings: PublicSettings;
}) {
  const route = getSupportCategory(input.routeKey);

  return `${supportWorkflowPrompt}

Current support route:
- Route key: ${route.key}
- Route label: ${route.label}
- Routing hint: ${route.routingHint}

Known contact details:
- Contact name: ${input.settings.contactName}
- Contact email: ${input.settings.contactEmail}
- Contact phone: ${input.settings.contactPhone}

Lead capture state:
- leadCaptured=${input.leadCaptured ? "true" : "false"}

Response rules:
- Start by answering the user's current request.
- Keep answers focused on the current route when the intent is clear.
- If the route is "${route.key}", explicitly guide the visitor toward ${route.label.toLowerCase()} next steps.
- If details are not confirmed, say the RESURGENCE team will verify them.
- If leadCaptured is true, do not repeat the full intake checklist unless the visitor wants to update their details.
- When formal follow-up is requested and leadCaptured is false, collect full name, organization, email, mobile number, and a brief summary.

Close with practical next steps and handoff guidance when helpful.`;
}
