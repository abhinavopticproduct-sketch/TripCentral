"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TripInfo = {
  destinationCity: string;
  startDate: string;
  endDate: string;
  hotelDetails: string;
  flightDetails: string;
  notes: string;
};

export function TripInfoForm({ tripId, initial }: { tripId: string; initial: TripInfo }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const startDateValue = values.startDate.slice(0, 10);
  const endDateValue = values.endDate.slice(0, 10);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (startDateValue < today) {
      setError("Start date cannot be before today.");
      setSaving(false);
      return;
    }

    if (endDateValue < today) {
      setError("End date cannot be before today.");
      setSaving(false);
      return;
    }

    if (endDateValue < startDateValue) {
      setError("End date cannot be before start date.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          startDate: startDateValue,
          endDate: endDateValue
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save trip info.");
        setSaving(false);
        return;
      }

      setSuccess("Trip info saved.");
      router.refresh();
    } catch {
      setError("Network error while saving trip info.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Destination</label>
          <input className="input" value={values.destinationCity} onChange={(e) => setValues({ ...values, destinationCity: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="input"
            type="date"
            min={today}
            value={startDateValue}
            onChange={(e) => {
              const nextStart = e.target.value;
              setValues((prev) => ({
                ...prev,
                startDate: nextStart,
                endDate: prev.endDate.slice(0, 10) < nextStart ? nextStart : prev.endDate
              }));
            }}
          />
          <input
            className="input"
            type="date"
            min={startDateValue || today}
            value={endDateValue}
            onChange={(e) => setValues({ ...values, endDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm">Hotel Details</label>
        <textarea className="input min-h-20" value={values.hotelDetails} onChange={(e) => setValues({ ...values, hotelDetails: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-sm">Flight Details</label>
        <textarea className="input min-h-20" value={values.flightDetails} onChange={(e) => setValues({ ...values, flightDetails: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-sm">Notes</label>
        <textarea className="input min-h-24" value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          {error ? <p className="text-red-600">{error}</p> : null}
          {success ? <p className="text-emerald-600">{success}</p> : null}
        </div>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Trip Info"}
        </button>
      </div>
    </form>
  );
}
