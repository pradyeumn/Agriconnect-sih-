"use client";

import { useState, useEffect } from "react";
import { MapPin, Sprout } from "lucide-react";
import LeafletMap from "@/components/maps/LeafletMap";
import { farmersApi } from "@/lib/api";

export default function BuyerMapPage() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarmersOnMap() {
      try {
        const res = await farmersApi.getAll();
        const farmMarkers = (res.data || []).map((f: any) => ({
          id: `farmer-${f.id}`,
          lat: f.latitude || 18.85,
          lng: f.longitude || 73.88,
          title: f.name,
          subtitle: `Crops: ${f.crops}`,
          type: "farmer" as const,
          details: (
            <div className="text-[11px] text-gray-600 mt-1">
              <div>District: {f.district}</div>
              <div className="text-emerald-700 font-bold">Reliability: {f.reliability_score}/100</div>
            </div>
          ),
        }));
        setMarkers(farmMarkers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFarmersOnMap();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <MapPin className="w-7 h-7 text-emerald-600" /> Nearby Certified Farmers Map
        </h1>
        <p className="text-sm text-gray-500">
          Discover certified farmers in your state/district and calculate transport distance to your delivery address.
        </p>
      </div>

      <div className="card p-2 shadow-lg">
        <LeafletMap
          center={[18.85, 73.88]}
          zoom={8}
          markers={markers}
          className="h-[550px] w-full rounded-2xl overflow-hidden"
        />
      </div>
    </div>
  );
}
