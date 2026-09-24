"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { Route } from "@/lib/geo";

// מפת מסלול: Leaflet עם אריחי OpenStreetMap (docs/spec-gps-map-share.md, "מפה").
// נטען רק בדפדפן — ראו route-map-lazy.tsx. dir="ltr": ה-CSS של Leaflet לא בנוי ל-RTL
export default function RouteMap({ route, className = "" }: { route: Route; className?: string }) {
  const segments: LatLngTuple[][] = route.map(segment => segment.map(([lat, lng]) => [lat, lng] as LatLngTuple));
  const all = segments.flat();
  if (all.length < 2) return null;

  const start = all[0];
  const end = all[all.length - 1];

  return (
    <div dir="ltr" className={`overflow-hidden rounded-[22px] border border-card-border ${className}`}>
      <MapContainer
        bounds={all}
        boundsOptions={{ padding: [24, 24] }}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        {segments.map((positions, i) => (
          <Polyline key={i} positions={positions} pathOptions={{ color: "#8f6fc6", weight: 5, opacity: 0.9 }} />
        ))}
        <CircleMarker center={start} radius={7} pathOptions={{ color: "#fff", weight: 3, fillColor: "#3f9b6b", fillOpacity: 1 }} />
        <CircleMarker center={end} radius={7} pathOptions={{ color: "#fff", weight: 3, fillColor: "#8f6fc6", fillOpacity: 1 }} />
      </MapContainer>
    </div>
  );
}
