"use client";

import { useRouter } from "next/navigation";

export function DeleteTripButton({ tripId }: { tripId: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm("Delete this trip and all associated data?")) return;

    const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <button type="button" className="btn-secondary border-red-200 text-red-600" onClick={remove}>
      Delete Trip
    </button>
  );
}