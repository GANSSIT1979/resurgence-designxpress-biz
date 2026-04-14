function parseJsonValue(key: string, value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Invalid JSON value for "${key}"`);
  }
}

function parseBooleanValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  return Boolean(value);
}

export function parseBodyValue(key: string, value: any) {
  if (value === "" || value === undefined) return null;

  const jsonKeys = new Set(["benefits", "deliverables", "socialLinks", "packageApplicability"]);
  const numberKeys = new Set(["sortOrder", "pointsPerGame", "assistsPerGame", "reboundsPerGame", "value", "totalAmount", "amount"]);
  const boolKeys = new Set(["featured", "active"]);
  const dateKeys = new Set(["issuedAt", "dueDate"]);

  if (jsonKeys.has(key)) {
    return parseJsonValue(key, value);
  }

  if (numberKeys.has(key)) {
    return Number(value);
  }

  if (boolKeys.has(key)) {
    return parseBooleanValue(value);
  }

  if (dateKeys.has(key)) {
    return value ? new Date(value) : null;
  }

  return value;
}

export function parsePayload<T extends Record<string, any>>(input: T) {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    const parsed = parseBodyValue(key, value);
    if (parsed !== null) out[key] = parsed;
  }
  return out;
}
