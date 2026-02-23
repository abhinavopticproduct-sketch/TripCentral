"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const today = new Date().toISOString().slice(0, 10);

const defaultValues = {
  name: "",
  destinationCity: "",
  startDate: today,
  endDate: today,
  totalBudget: "",
  baseCurrency: "USD"
};

export function NewTripForm() {
  const router = useRouter();
  const [values, setValues] = useState(defaultValues);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (values.startDate < today) {
      setError("Start date cannot be before today.");
      return;
    }

    if (values.endDate < today) {
      setError("End date cannot be before today.");
      return;
    }

    if (values.endDate < values.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, totalBudget: Number(values.totalBudget) })
    });

    if (!res.ok) {
      setError("Could not create trip");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <label className="mb-1 block text-sm">Trip Name</label>
        <input className="input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
      </div>
      <div>
        <label className="mb-1 block text-sm">Destination City</label>
        <input className="input" value={values.destinationCity} onChange={(e) => setValues({ ...values, destinationCity: e.target.value })} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Start Date</label>
          <input
            className="input"
            type="date"
            min={today}
            value={values.startDate}
            onChange={(e) => {
              const nextStart = e.target.value;
              setValues((prev) => ({
                ...prev,
                startDate: nextStart,
                endDate: prev.endDate < nextStart ? nextStart : prev.endDate
              }));
            }}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">End Date</label>
          <input
            className="input"
            type="date"
            min={values.startDate || today}
            value={values.endDate}
            onChange={(e) => setValues({ ...values, endDate: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Total Budget</label>
          <input className="input" type="number" step="0.01" value={values.totalBudget} onChange={(e) => setValues({ ...values, totalBudget: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm">Base Currency</label>
          <input className="input" maxLength={3} value={values.baseCurrency} onChange={(e) => setValues({ ...values, baseCurrency: e.target.value.toUpperCase() })} required />
        </div>
      </div>

      {error ? <p className="rounded-xl bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      <button className="btn-primary" type="submit">Create Trip</button>
    </form>
  );
}
