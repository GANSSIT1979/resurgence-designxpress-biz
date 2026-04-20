function parseArgs(values) {
  return values.reduce((acc, value) => {
    if (!value.startsWith("--")) return acc;
    const [rawKey, rawVal] = value.slice(2).split("=");
    acc[rawKey] = rawVal ?? "true";
    return acc;
  }, {});
}

function normalizeBaseUrl(value) {
  return String(value || "http://127.0.0.1:3000").replace(/\/+$/, "");
}

const args = parseArgs(process.argv.slice(2));
const baseUrl = normalizeBaseUrl(args["base-url"] || process.env.RUNTIME_VERIFY_BASE_URL || "http://127.0.0.1:3000");
const results = [];

function record(name, ok, details) {
  results.push({ name, ok, details });
}

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();

  try {
    return { response, text, json: JSON.parse(text) };
  } catch {
    return { response, text, json: null };
  }
}

async function verifyRoute(path, allowedStatuses = [200]) {
  try {
    const result = await request(path);
    record(
      path,
      allowedStatuses.includes(result.response.status),
      `HTTP ${result.response.status}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    record(path, false, message);
  }
}

async function verifyJson(path, allowedStatuses, predicate, label) {
  try {
    const result = await request(path);
    const statusOk = allowedStatuses.includes(result.response.status);
    const bodyOk = statusOk && predicate(result.json);
    record(
      path,
      bodyOk,
      `${label}; HTTP ${result.response.status}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    record(path, false, message);
  }
}

async function verifyPost(path, allowedStatuses, body = {}) {
  try {
    const result = await request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    record(
      path,
      allowedStatuses.includes(result.response.status),
      `HTTP ${result.response.status}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    record(path, false, message);
  }
}

function printResults() {
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}`);
    console.log(`      ${result.details}`);
  }
}

async function main() {
  console.log(`Verifying runtime routes against ${baseUrl}`);

  for (const path of [
    "/",
    "/feed",
    "/login",
    "/contact",
    "/support",
    "/creators",
    "/shop",
    "/cart",
    "/checkout",
    "/sponsor/apply",
    "/admin",
    "/admin/users",
    "/creator/dashboard",
    "/creator/posts",
    "/sponsor/dashboard",
    "/sponsor/placements",
    "/cashier",
  ]) {
    await verifyRoute(path, [200]);
  }

  await verifyJson("/api/health", [200], (json) => Boolean(json?.ok), "Health payload ok");
  await verifyJson("/api/feed", [200], (json) => Array.isArray(json?.items), "Feed payload includes items");
  await verifyJson("/api/feed/promoted", [200], (json) => Array.isArray(json?.items), "Promoted payload includes items");
  await verifyJson("/api/shop/products", [200], (json) => Array.isArray(json?.items), "Shop payload includes items");
  await verifyJson("/api/chatkit/session", [200], (json) => Boolean(json?.ok), "Chatkit health payload ok");
  await verifyRoute("/api/uploads/image", [405]);

  for (const path of [
    "/api/feed/runtime-smoke-post/like",
    "/api/feed/runtime-smoke-post/save",
    "/api/feed/runtime-smoke-post/comments",
    "/api/feed/creators/runtime-smoke-creator/follow",
  ]) {
    await verifyPost(path, [401], {});
  }

  printResults();

  if (results.some((result) => !result.ok)) {
    process.exitCode = 1;
    return;
  }

  console.log("Runtime route verification passed.");
}

main().catch((error) => {
  console.error("Runtime route verification failed unexpectedly:", error);
  process.exitCode = 1;
});
