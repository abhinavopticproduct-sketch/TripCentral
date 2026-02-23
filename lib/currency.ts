type ExchangeRatesPayload = {
  rates: Record<string, number>;
  timestamp: string;
};

const rateCache = new Map<string, { data: ExchangeRatesPayload; expiresAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

async function fetchJsonWithTimeout(url: string, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 1800 } });
    if (!res.ok) return null;
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeRates(data: unknown): ExchangeRatesPayload | null {
  if (!data || typeof data !== "object") return null;

  const payload = data as Record<string, unknown>;
  const rates = payload.rates as Record<string, number> | undefined;
  if (!rates || typeof rates !== "object") return null;

  const timestamp =
    (payload.date as string | undefined) ||
    (payload.time_last_update_utc as string | undefined) ||
    new Date().toISOString();

  return { rates, timestamp };
}

export async function getExchangeRates(base: string) {
  const baseUpper = base.toUpperCase();
  const now = Date.now();
  const cached = rateCache.get(baseUpper);

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const apiBase = process.env.EXCHANGE_API_BASE || "https://api.exchangerate.host";
  const candidates = [
    `${apiBase}/latest?base=${encodeURIComponent(baseUpper)}`,
    `https://open.er-api.com/v6/latest/${encodeURIComponent(baseUpper)}`,
    `https://api.frankfurter.app/latest?from=${encodeURIComponent(baseUpper)}`
  ];

  for (const url of candidates) {
    try {
      const data = await fetchJsonWithTimeout(url);
      const normalized = normalizeRates(data);

      if (normalized) {
        rateCache.set(baseUpper, { data: normalized, expiresAt: now + CACHE_TTL_MS });
        return normalized;
      }
    } catch {
      // Continue to next provider.
    }
  }

  if (cached) return cached.data;

  throw new Error("Exchange rates are currently unavailable.");
}

export function convertToBase(amount: number, from: string, base: string, rates: Record<string, number>) {
  const fromUpper = from.toUpperCase();
  const baseUpper = base.toUpperCase();

  if (fromUpper === baseUpper) return amount;

  const rate = rates[fromUpper];
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`No exchange rate for ${fromUpper}`);
  }

  return amount / rate;
}
