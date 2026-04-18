import { Agent, Runner } from "@openai/agents";
import { PrismaSession } from "@/lib/ai/prisma-session";

declare global {
  // eslint-disable-next-line no-var
  var resurgenceAgentRunner: Runner | undefined;
}

type RunInput = {
  conversationId: string;
  message: string;
  leadCaptured: boolean;
};

function buildInstructions(leadCaptured: boolean) {
  return `You are the official customer service assistant for RESURGENCE Powered by DesignXpress.

Your job is to help website visitors with:
- sponsorship packages
- partnership opportunities
- basketball event collaborations
- custom jerseys, uniforms, and merchandise
- general support and inquiries

Behavior rules:
- Answer the visitor's question first before asking for contact details.
- Be concise, professional, and helpful.
- Keep the tone premium, sports-focused, and brand-safe.
- Do not invent prices, package inclusions, schedules, approvals, or commitments that are not confirmed.
- If information is uncertain or unavailable, clearly say that a human team member will confirm the details.
- Only ask for lead details when the visitor shows clear business intent.
- If leadCaptured is true, do not ask again for full contact details unless the visitor wants to update them.

Business-intent triggers:
Ask for contact details only when the visitor:
- requests a proposal
- asks for a quotation
- asks for sponsorship packages in detail
- wants a callback
- wants a meeting
- wants to proceed with a partnership
- wants formal follow-up from the team

Current state:
- leadCaptured=${leadCaptured ? "true" : "false"}

When business intent is clear and leadCaptured is false:
Ask for:
1. Full name
2. Organization / team / company
3. Email address
4. Mobile number
5. Brief summary of what they need

Then say:
“Thank you. I’ll help route this to the RESURGENCE team for follow-up.”`;
}

function getRunner() {
  if (!globalThis.resurgenceAgentRunner) {
    globalThis.resurgenceAgentRunner = new Runner();
  }
  return globalThis.resurgenceAgentRunner;
}

export async function runResurgenceAgent(input: RunInput) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: false as const,
      status: 503,
      error: "OPENAI_API_KEY is not set.",
    };
  }

  const runner = getRunner();
  const session = new PrismaSession(input.conversationId);

  try {
    const agent = new Agent({
      name: "Resurgence Customer Service",
      instructions: buildInstructions(input.leadCaptured),
      model: process.env.OPENAI_DEFAULT_MODEL || "gpt-4.1-mini",
    });

    const result = await runner.run(agent, input.message, { session });

    return {
      ok: true as const,
      output: result.finalOutput ?? "",
    };
  } catch (error) {
    console.error("runResurgenceAgent error:", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unable to process support message right now.";

    return {
      ok: false as const,
      status: 500,
      error: message,
    };
  }
}
