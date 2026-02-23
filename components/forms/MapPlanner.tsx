"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const DynamicMap = dynamic(() => import("@/components/map/MapCanvas"), { ssr: false });

const markerTypes = ["HOTEL", "RESTAURANT", "TOURIST_SPOT", "CUSTOM"] as const;
type MarkerType = (typeof markerTypes)[number];

type MarkerItem = {
  id: string;
  label: string;
  markerType: string;
  note: string;
  lat: number;
  lng: number;
};

export function MapPlanner({
  tripId,
  destination,
  initialLocations
}: {
  tripId: string;
  destination: { lat: number; lng: number };
  initialLocations: MarkerItem[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [label, setLabel] = useState("");
  const [markerType, setMarkerType] = useState<MarkerType>("CUSTOM");
  const [note, setNote] = useState("");

  const markers = useMemo(() => initialLocations, [initialLocations]);

  async function addMarker() {
    if (!selected || !label.trim()) return;
    await fetch(`/api/trips/${tripId}/map-locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        markerType,
        note,
        lat: selected.lat,
        lng: selected.lng
      })
    });
    setLabel("");
    setNote("");
    setSelected(null);
    router.refresh();
  }

  async function removeMarker(locationId: string) {
    await fetch(`/api/trips/${tripId}/map-locations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId })
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <DynamicMap center={destination} markers={markers} onSelect={setSelected} />

      <div className="card grid gap-3 p-4 md:grid-cols-2">
        <input className="input" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <select className="input" value={markerType} onChange={(e) => setMarkerType(e.target.value as MarkerType)}>
          <option value="HOTEL">Hotel</option>
          <option value="RESTAURANT">Restaurant</option>
          <option value="TOURIST_SPOT">Tourist Spot</option>
          <option value="CUSTOM">Custom</option>
        </select>
        <textarea className="input md:col-span-2" placeholder="Notes" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="button" className="btn-primary md:w-fit" onClick={addMarker} disabled={!selected}>
          Save Marker {selected ? `(${selected.lat.toFixed(3)}, ${selected.lng.toFixed(3)})` : ""}
        </button>
      </div>

      <div className="card p-4">
        <p className="mb-2 text-sm font-medium">Saved Locations</p>
        <ul className="space-y-2 text-sm">
          {markers.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
              <span>{m.label} ({m.markerType}) - {m.note || "No note"}</span>
              <button className="text-red-600" type="button" onClick={() => removeMarker(m.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}