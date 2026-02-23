"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  name: string;
  packed: boolean;
};

export function PackingListClient({ tripId, initialItems }: { tripId: string; initialItems: Item[] }) {
  const router = useRouter();
  const [name, setName] = useState("");

  const progress = useMemo(() => {
    if (initialItems.length === 0) return 0;
    const packedCount = initialItems.filter((item) => item.packed).length;
    return (packedCount / initialItems.length) * 100;
  }, [initialItems]);

  async function addItem() {
    if (!name.trim()) return;
    await fetch(`/api/trips/${tripId}/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    setName("");
    router.refresh();
  }

  async function toggleItem(itemId: string, packed: boolean) {
    await fetch(`/api/trips/${tripId}/packing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, packed })
    });
    router.refresh();
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/trips/${tripId}/packing`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId })
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex gap-2">
          <input className="input" placeholder="Add item" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-primary" type="button" onClick={addItem}>Add</button>
        </div>
        <div className="mt-4 h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-600">Packed: {progress.toFixed(0)}%</p>
      </div>

      <div className="card p-4">
        <ul className="space-y-2">
          {initialItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={item.packed} onChange={(e) => toggleItem(item.id, e.target.checked)} />
                <span className={item.packed ? "line-through text-slate-400" : ""}>{item.name}</span>
              </label>
              <button className="text-xs text-red-600" onClick={() => deleteItem(item.id)} type="button">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}