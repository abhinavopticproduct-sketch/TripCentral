"use client";

import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

type MarkerData = {
  id: string;
  label: string;
  note: string;
  lat: number;
  lng: number;
};

function ClickHandler({ onSelect }: { onSelect: (point: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return null;
}

export default function MapCanvas({
  center,
  markers,
  onSelect
}: {
  center: { lat: number; lng: number };
  markers: MarkerData[];
  onSelect: (point: { lat: number; lng: number }) => void;
}) {
  return (
    <div className="card h-[360px] overflow-hidden">
      <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={onSelect} />
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={icon}>
            <Popup>
              <strong>{marker.label}</strong>
              <p>{marker.note || "No note"}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}