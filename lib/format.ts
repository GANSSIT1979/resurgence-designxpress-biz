export function currencyPHP(value: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function formatDate(input: string | Date | null | undefined) {
  if (!input) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium"
  }).format(new Date(input));
}

export function parseJsonSafely<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
