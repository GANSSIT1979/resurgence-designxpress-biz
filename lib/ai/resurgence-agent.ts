type AgentSdkModule = {
  Agent: new (config: {
    name: string;
    instructions: string;
    model: string;
    modelSettings?: Record<string, unknown>;
  }) => unknown;
  Runner: new (config?: Record<string, unknown>) => {
    run: (
      agent: unknown,
      input: string,
      options?: Record<string, unknown>
    ) => Promise<{ finalOutput?: string | null }>;
  };
};

type PrismaSessionLike = unknown;

declare global {
  // eslint-disable-next-line no-var
  var resurgenceAgentsSdkPromise: Promise<AgentSdkModule | null> | undefined;
  // eslint-disable-next-line no-var
  var resurgenceAgentsRunner: InstanceType<AgentSdkModule["Runner"]> | undefined;
}

const globalForAi = globalThis as typeof globalThis & {
  resurgenceAgentsSdkPromise?: Promise<AgentSdkModule | null>;
  resurgenceAgentsRunner?: InstanceType<AgentSdkModule["Runner"]>;
};

function getAgentInstructions(leadCaptured: boolean) {
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

Current state:
- leadCaptured=${leadCaptured ? "true" : "false"}

When business intent is clear and leadCaptured is false, ask for:
1. Full name
2. Organization / team / company
3. Email address
4. Mobile number
5. Brief summary of what they need

Then say:
“Thank you. I’ll help route this to the RESURGENCE team for follow-up.”`;
}

async function loadAgentsSdk(): Promise<AgentSdkModule | null> {
  if (!globalForAi.resurgenceAgentsSdkPromise) {
    globalForAi.resurgenceAgentsSdkPromise = (async () => {
      try {
        // Avoid a statically analyzable module specifier so Next/Webpack
        // does not try to resolve @openai/agents during the build.
        const pkg = "@openai" + "/agents";
        const dynamicImporter = new Function(
          "moduleName",
          "return import(moduleName);"
        ) as (moduleName: string) => Promise<AgentSdkModule>;

        return await dynamicImporter(pkg);
      } catch {
        return null;
      }
    })();
  }

  return globalForAi.resurgenceAgentsSdkPromise;
}

async function getRunner(sdk: AgentSdkModule) {
  if (!globalForAi.resurgenceAgentsRunner) {
    globalForAi.resurgenceAgentsRunner = new sdk.Runner();
  }

  return globalForAi.resurgenceAgentsRunner;
}

export async function runResurgenceAgent(input: {
  message: string;
  leadCaptured: boolean;
  session?: PrismaSessionLike;
}) {
  const sdk = await loadAgentsSdk();

  if (!sdk) {
    return {
      ok: false as const,
      status: 503,
      error: "AI support is currently disabled. Install optional AI packages to enable live support replies.",
    };
  }

  const runner = await getRunner(sdk);

  const agent = new sdk.Agent({
    name: "Resurgence Customer Service",
    instructions: getAgentInstructions(input.leadCaptured),
    model: "gpt-5.4-mini",
    modelSettings: {
      reasoning: {
        effort: "low",
        summary: "auto",
      },
    },
  });

  const result = await runner.run(agent, input.message, input.session ? { session: input.session } : undefined);

  return {
    ok: true as const,
    output: result.finalOutput ?? "",
  };
}
