export async function getExchangeRates(base: string) {
  const apiBase = process.env.EXCHANGE_API_BASE || "https://api.exchangerate.host";
  const url = `${apiBase}/latest?base=${encodeURIComponent(base.toUpperCase())}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });

  if (!res.ok) {
    throw new Error("Failed to fetch exchange rates");
  }

  const data = await res.json();
  return {
    rates: data.rates as Record<string, number>,
    timestamp: data.date || new Date().toISOString()
  };
}

export function convertToBase(amount: number, from: string, base: string, rates: Record<string, number>) {
  const fromUpper = from.toUpperCase();
  const baseUpper = base.toUpperCase();

  if (fromUpper === baseUpper) return amount;

  const rate = rates[fromUpper];
  if (!rate) {
    throw new Error(`No exchange rate for ${fromUpper}`);
  }

  return amount / rate;
}