"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["FOOD", "TRANSPORT", "HOTEL", "ACTIVITIES", "OTHER"];

export function ExpenseForm({ tripId, baseCurrency }: { tripId: string; baseCurrency: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      category: String(formData.get("category") ?? "OTHER"),
      amount: Number(formData.get("amount") ?? 0),
      currency: String(formData.get("currency") ?? baseCurrency),
      date: String(formData.get("date") ?? new Date().toISOString())
    };

    const res = await fetch(`/api/trips/${tripId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      setError("Failed to save expense");
      return;
    }

    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <input name="title" placeholder="Title" className="input" required />
      <select name="category" className="input" defaultValue="OTHER">
        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <input type="number" step="0.01" name="amount" placeholder="Amount" className="input" required />
      <input name="currency" defaultValue={baseCurrency} className="input" maxLength={3} required />
      <input type="date" name="date" className="input" required />
      <div className="sm:col-span-2 lg:col-span-5 flex items-center justify-between">
        {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
        <button className="btn-primary" type="submit">Add Expense</button>
      </div>
    </form>
  );
}