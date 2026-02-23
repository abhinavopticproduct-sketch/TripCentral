"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["FOOD", "TRANSPORT", "HOTEL", "ACTIVITIES", "OTHER"];

export function ExpenseForm({ tripId, baseCurrency }: { tripId: string; baseCurrency: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNote(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      category: String(formData.get("category") ?? "OTHER"),
      amount: Number(formData.get("amount") ?? 0),
      currency: String(formData.get("currency") ?? baseCurrency).toUpperCase(),
      date: String(formData.get("date") ?? new Date().toISOString())
    };

    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to save expense");
        setLoading(false);
        return;
      }

      if (data.note) {
        setNote(data.note);
      }

      e.currentTarget.reset();
      const dateInput = e.currentTarget.querySelector("input[name='date']") as HTMLInputElement | null;
      if (dateInput) dateInput.value = today;
    } catch {
      setError("Network error while saving expense.");
    } finally {
      setLoading(false);
    }
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
      <input type="date" name="date" className="input" defaultValue={today} required />
      <div className="sm:col-span-2 lg:col-span-5 flex items-center justify-between">
        <div className="text-sm">
          {error ? <p className="text-red-600">{error}</p> : null}
          {note ? <p className="text-amber-600">{note}</p> : null}
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Expense"}
        </button>
      </div>
    </form>
  );
}
