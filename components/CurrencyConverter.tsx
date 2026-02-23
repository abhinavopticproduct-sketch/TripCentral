"use client";

import { useState } from "react";

export function CurrencyConverter({ tripId, baseCurrency }: { tripId: string; baseCurrency: string }) {
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  async function convert() {
    const res = await fetch(`/api/trips/${tripId}/exchange?to=${to}`);
    if (!res.ok) {
      setResult("Conversion unavailable");
      return;
    }

    const data = await res.json();
    const converted = Number(amount) * data.rate;
    setResult(`${amount} ${data.from} = ${converted.toFixed(2)} ${data.to}`);
    setUpdated(data.timestamp);
  }

  return (
    <div className="card p-4">
      <p className="mb-3 text-sm font-medium">Currency Converter</p>
      <div className="grid gap-2 sm:grid-cols-4">
        <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" />
        <input className="input bg-slate-50" value={baseCurrency} readOnly />
        <input className="input" value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} maxLength={3} />
        <button type="button" className="btn-primary" onClick={convert}>Convert</button>
      </div>
      {result ? <p className="mt-3 text-sm text-slate-700">{result}</p> : null}
      {updated ? <p className="mt-1 text-xs text-slate-500">Last updated: {updated}</p> : null}
    </div>
  );
}