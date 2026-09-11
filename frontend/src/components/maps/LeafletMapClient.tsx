"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker default icons in Next.js
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const farmerIcon = createCustomIcon("#16a34a"); // Emerald green
const centerIcon = createCustomIcon("#2563eb"); // Blue
const buyerIcon = createCustomIcon("#d97706"); // Amber
const selectedIcon = createCustomIcon("#dc2626"); // Red

interface MarkerPoint {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: "farmer" | "center" | "buyer";
  details?: React.ReactNode;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerPoint[];
  selectable?: boolean;
  onSelectLocation?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  className?: string;
  style?: React.CSSProperties;
}

function LocationPicker({ onSelectLocation }: { onSelectLocation?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onSelectLocation) {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function LeafletMapClient({
  center = [20.5937, 78.9629], // Default India center
  zoom = 6,
  markers = [],
  selectable = false,
  onSelectLocation,
  selectedLocation,
  className = "h-[450px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm",
  style,
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400 font-medium text-sm`}>
        Loading Map View...
      </div>
    );
  }

  const getMarkerIcon = (type: "farmer" | "center" | "buyer") => {
    switch (type) {
      case "farmer":
        return farmerIcon;
      case "center":
        return centerIcon;
      case "buyer":
        return buyerIcon;
      default:
        return farmerIcon;
    }
  };

  return (
    <div className={className} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectable && <LocationPicker onSelectLocation={onSelectLocation} />}

        {selectedLocation && (
          <Marker position={selectedLocation} icon={selectedIcon}>
            <Popup>
              <div className="text-xs font-semibold text-gray-800">Selected Location</div>
              <div className="text-xs text-gray-500">
                Lat: {selectedLocation[0].toFixed(4)}, Lng: {selectedLocation[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {markers.map((m) => (
          <Marker key={`${m.type}-${m.id}`} position={[m.lat, m.lng]} icon={getMarkerIcon(m.type)}>
            <Popup>
              <div className="p-1 min-w-[160px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      m.type === "farmer"
                        ? "bg-emerald-600"
                        : m.type === "center"
                        ? "bg-blue-600"
                        : "bg-amber-600"
                    }`}
                  />
                  <span className="text-xs font-bold text-gray-900">{m.title}</span>
                </div>
                {m.subtitle && <p className="text-xs text-gray-600 mb-1">{m.subtitle}</p>}
                {m.details}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
