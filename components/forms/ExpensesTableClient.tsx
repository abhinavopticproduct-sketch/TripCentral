"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["FOOD", "TRANSPORT", "HOTEL", "ACTIVITIES", "OTHER"] as const;

type ExpenseRow = {
  id: string;
  title: string;
  category: string;
  amountOriginal: number;
  currencyOriginal: string;
  amountBase: number;
  date: string;
};

type EditState = {
  title: string;
  category: string;
  amount: string;
  currency: string;
  date: string;
};

export function ExpensesTableClient({
  tripId,
  baseCurrency,
  expenses
}: {
  tripId: string;
  baseCurrency: string;
  expenses: ExpenseRow[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function beginEdit(expense: ExpenseRow) {
    setError(null);
    setNote(null);
    setEditingId(expense.id);
    setEditState({
      title: expense.title,
      category: expense.category,
      amount: String(expense.amountOriginal),
      currency: expense.currencyOriginal,
      date: expense.date.slice(0, 10)
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(null);
  }

  async function saveEdit(expenseId: string) {
    if (!editState) return;
    setLoadingId(expenseId);
    setError(null);
    setNote(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editState.title,
          category: editState.category,
          amount: Number(editState.amount),
          currency: editState.currency.toUpperCase(),
          date: editState.date
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to update expense.");
        return;
      }

      if (data.note) setNote(data.note);
      cancelEdit();
      router.refresh();
    } catch {
      setError("Network error while updating expense.");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteExpense(expenseId: string) {
    if (!confirm("Delete this expense?")) return;

    setLoadingId(expenseId);
    setError(null);
    setNote(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        setError("Failed to delete expense.");
        return;
      }
      if (editingId === expenseId) cancelEdit();
      router.refresh();
    } catch {
      setError("Network error while deleting expense.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="card overflow-x-auto p-4">
      <div className="mb-3 text-sm">
        {error ? <p className="text-red-600">{error}</p> : null}
        {note ? <p className="text-amber-600">{note}</p> : null}
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-600">
            <th className="pb-2">Title</th>
            <th className="pb-2">Category</th>
            <th className="pb-2">Original</th>
            <th className="pb-2">Base ({baseCurrency})</th>
            <th className="pb-2">Date</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td className="py-4 text-slate-500" colSpan={6}>
                No expenses added yet.
              </td>
            </tr>
          ) : null}
          {expenses.map((expense) => {
            const editing = editingId === expense.id && editState;
            const busy = loadingId === expense.id;

            return (
              <tr key={expense.id} className="border-b border-slate-100 align-top">
                <td className="py-2">
                  {editing ? (
                    <input
                      className="input"
                      value={editState.title}
                      onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                    />
                  ) : (
                    expense.title
                  )}
                </td>
                <td className="py-2">
                  {editing ? (
                    <select
                      className="input"
                      value={editState.category}
                      onChange={(e) => setEditState({ ...editState, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    expense.category
                  )}
                </td>
                <td className="py-2">
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        value={editState.amount}
                        onChange={(e) => setEditState({ ...editState, amount: e.target.value })}
                      />
                      <input
                        className="input w-24"
                        maxLength={3}
                        value={editState.currency}
                        onChange={(e) => setEditState({ ...editState, currency: e.target.value.toUpperCase() })}
                      />
                    </div>
                  ) : (
                    `${expense.currencyOriginal} ${expense.amountOriginal.toFixed(2)}`
                  )}
                </td>
                <td className="py-2">{expense.amountBase.toFixed(2)}</td>
                <td className="py-2">
                  {editing ? (
                    <input
                      className="input"
                      type="date"
                      value={editState.date}
                      onChange={(e) => setEditState({ ...editState, date: e.target.value })}
                    />
                  ) : (
                    new Date(expense.date).toLocaleDateString()
                  )}
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          className="btn-primary px-3 py-1"
                          disabled={busy}
                          onClick={() => saveEdit(expense.id)}
                        >
                          {busy ? "Saving..." : "Save"}
                        </button>
                        <button type="button" className="btn-secondary px-3 py-1" disabled={busy} onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button type="button" className="btn-secondary px-3 py-1" disabled={busy} onClick={() => beginEdit(expense)}>
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-secondary border-red-200 px-3 py-1 text-red-600"
                      disabled={busy}
                      onClick={() => deleteExpense(expense.id)}
                    >
                      {busy ? "..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
