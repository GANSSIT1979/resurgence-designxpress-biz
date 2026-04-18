import { createHmac } from "node:crypto";

const args = parseArgs(process.argv.slice(2));
const baseUrl = normalizeBaseUrl(
  args["base-url"] || process.env.SUPPORT_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
);
const webhookSecret = args["webhook-secret"] || process.env.OPENAI_WEBHOOK_SECRET || "";

const verificationScenarios = [
  {
    key: "sponsorships",
    prompt: "We are a brand interested in sponsorship packages and proposal options for RESURGENCE.",
  },
  {
    key: "events",
    prompt: "We want to collaborate on a basketball event and need booking or activation details.",
  },
  {
    key: "custom-apparel",
    prompt: "We need custom jerseys and team uniforms and want pricing and turnaround details.",
  },
  {
    key: "partnerships",
    prompt: "We want a media partnership and creator collaboration with RESURGENCE.",
  },
];

const results = [];

function parseArgs(values) {
  return values.reduce((acc, value) => {
    if (!value.startsWith("--")) return acc;
    const [rawKey, rawVal] = value.slice(2).split("=");
    acc[rawKey] = rawVal ?? "true";
    return acc;
  }, {});
}

function normalizeBaseUrl(value) {
  return String(value).replace(/\/+$/, "");
}

function decodeWebhookSecret(secret) {
  if (secret.startsWith("whsec_")) {
    return Buffer.from(secret.slice("whsec_".length), "base64");
  }

  return Buffer.from(secret, "utf8");
}

function signWebhookPayload(secret, payload, webhookId, timestamp) {
  return createHmac("sha256", decodeWebhookSecret(secret))
    .update(`${webhookId}.${timestamp}.${payload}`)
    .digest("base64");
}

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();

  try {
    return {
      response,
      text,
      json: JSON.parse(text),
    };
  } catch {
    return {
      response,
      text,
      json: null,
    };
  }
}

function record(name, ok, details) {
  results.push({ name, ok, details });
}

function printResults() {
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}`);
    console.log(`      ${result.details}`);
  }
}

async function verify() {
  console.log(`Verifying RESURGENCE support routes against ${baseUrl}`);

  const supportResponse = await fetch(`${baseUrl}/support`);
  const supportHtml = await supportResponse.text();
  record(
    "/support",
    supportResponse.ok && supportHtml.includes("RESURGENCE"),
    supportResponse.ok
      ? "Support page responded successfully."
      : `Unexpected status ${supportResponse.status}`,
  );

  const sessionHealth = await requestJson("/api/chatkit/session");
  record(
    "/api/chatkit/session GET",
    sessionHealth.response.ok && Boolean(sessionHealth.json?.ok),
    sessionHealth.response.ok
      ? `chatkitReady=${Boolean(sessionHealth.json?.chatkitReady)} webhookReady=${Boolean(sessionHealth.json?.webhookReady)}`
      : `Unexpected status ${sessionHealth.response.status}`,
  );

  const conversationId = `support-verify-${Date.now()}`;
  const sessionBootstrap = await requestJson("/api/chatkit/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
  });
  record(
    "/api/chatkit/session POST conversation",
    sessionBootstrap.response.ok && Boolean(sessionBootstrap.json?.conversationId),
    sessionBootstrap.response.ok
      ? `conversationId=${sessionBootstrap.json?.conversationId}`
      : `Unexpected status ${sessionBootstrap.response.status}`,
  );

  const chatkitReady = Boolean(sessionHealth.json?.chatkitReady);
  const chatkitCreate = await requestJson("/api/chatkit/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "chatkit",
      userId: `support-workflow-${Date.now()}`,
    }),
  });
  record(
    "/api/chatkit/session POST chatkit",
    chatkitReady &&
      chatkitCreate.response.ok &&
      typeof chatkitCreate.json?.client_secret === "string" &&
      typeof chatkitCreate.json?.sessionId === "string",
    chatkitCreate.response.ok
      ? "ChatKit client secret issued."
      : `Unexpected status ${chatkitCreate.response.status}: ${chatkitCreate.json?.error || chatkitCreate.text}`,
  );

  for (const scenario of verificationScenarios) {
    const scenarioResponse = await requestJson("/api/chatkit/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: `support-scenario-${scenario.key}-${Date.now()}`,
        message: scenario.prompt,
      }),
    });

    record(
      `Support routing: ${scenario.key}`,
      scenarioResponse.response.ok && scenarioResponse.json?.routeKey === scenario.key,
      scenarioResponse.response.ok
        ? `routeKey=${scenarioResponse.json?.routeKey} routeLabel=${scenarioResponse.json?.routeLabel}`
        : `Unexpected status ${scenarioResponse.response.status}: ${scenarioResponse.json?.error || scenarioResponse.text}`,
    );
  }

  const webhookHealth = await requestJson("/api/openai/webhook");
  record(
    "/api/openai/webhook GET",
    webhookHealth.response.ok && Boolean(webhookHealth.json?.ok),
    webhookHealth.response.ok
      ? `webhookReady=${Boolean(webhookHealth.json?.webhookReady)}`
      : `Unexpected status ${webhookHealth.response.status}`,
  );

  const webhookId = `evt_verify_${Date.now()}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const payload = JSON.stringify({
    id: webhookId,
    created_at: Number(timestamp),
    type: "response.completed",
    data: {
      id: `resp_verify_${Date.now()}`,
    },
  });

  if (webhookSecret) {
    const signature = signWebhookPayload(webhookSecret, payload, webhookId, timestamp);
    const webhookVerify = await requestJson("/api/openai/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "webhook-id": webhookId,
        "webhook-timestamp": timestamp,
        "webhook-signature": `v1,${signature}`,
      },
      body: payload,
    });

    record(
      "/api/openai/webhook POST signed",
      webhookVerify.response.ok && Boolean(webhookVerify.json?.verified),
      webhookVerify.response.ok
        ? `eventType=${webhookVerify.json?.eventType}`
        : `Unexpected status ${webhookVerify.response.status}: ${webhookVerify.json?.error || webhookVerify.text}`,
    );
  } else {
    record(
      "/api/openai/webhook POST signed",
      false,
      "Skipped because --webhook-secret or OPENAI_WEBHOOK_SECRET was not provided to the verifier.",
    );
  }

  printResults();

  if (results.some((result) => !result.ok)) {
    process.exitCode = 1;
    return;
  }

  console.log("All support verification checks passed.");
}

verify().catch((error) => {
  console.error("Support verification failed unexpectedly:", error);
  process.exitCode = 1;
});
