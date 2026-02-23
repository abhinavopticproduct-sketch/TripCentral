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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Destination</label>
          <input className="input" value={values.destinationCity} onChange={(e) => setValues({ ...values, destinationCity: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="date" value={values.startDate.slice(0,10)} onChange={(e) => setValues({ ...values, startDate: e.target.value })} />
          <input className="input" type="date" value={values.endDate.slice(0,10)} onChange={(e) => setValues({ ...values, endDate: e.target.value })} />
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

      <button className="btn-primary" type="submit">Save Trip Info</button>
    </form>
  );
}