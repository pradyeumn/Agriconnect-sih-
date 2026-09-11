"use client";

import { useState, useEffect } from "react";
import { MapPin, Filter, Layers, Users, Building2, Store } from "lucide-react";
import LeafletMap from "@/components/maps/LeafletMap";
import { farmersApi, collectionCentersApi, buyersApi } from "@/lib/api";

export default function AdminMapPage() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    async function loadMapData() {
      try {
        const [farmRes, centerRes, buyerRes] = await Promise.all([
          farmersApi.getAll(),
          collectionCentersApi.getAll(),
          buyersApi.getAll(),
        ]);

        const farmMarkers = (farmRes.data || []).map((f: any) => ({
          id: `farmer-${f.id}`,
          lat: f.latitude || 18.85,
          lng: f.longitude || 73.88,
          title: `Farmer: ${f.name}`,
          subtitle: `${f.crops} (${f.farm_size} Acres)`,
          type: "farmer" as const,
          details: (
            <div className="text-[11px] text-gray-600 mt-1">
              <div>District: {f.district}</div>
              <div>Reliability: {f.reliability_score}/100</div>
            </div>
          ),
        }));

        const centerMarkers = (centerRes.data || []).map((c: any) => ({
          id: `center-${c.id}`,
          lat: c.latitude || 18.52,
          lng: c.longitude || 73.85,
          title: `Depot: ${c.name}`,
          subtitle: `Capacity: ${c.capacity} Qtl`,
          type: "center" as const,
          details: <div className="text-[11px] text-blue-700 font-semibold">{c.address}</div>,
        }));

        const buyerMarkers = (buyerRes.data || []).map((b: any) => ({
          id: `buyer-${b.id}`,
          lat: b.latitude || 18.49,
          lng: b.longitude || 73.86,
          title: `Buyer: ${b.name}`,
          subtitle: b.phone,
          type: "buyer" as const,
        }));

        setMarkers([...farmMarkers, ...centerMarkers, ...buyerMarkers]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMapData();
  }, []);

  const filteredMarkers = markers.filter((m) => filterType === "all" || m.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-amber-600" /> GIS Spatial Map View
          </h1>
          <p className="text-sm text-gray-500">
            Geographical spatial visualization of registered farmers, collection depots, and buyer delivery addresses.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span className="font-semibold text-gray-700">Farmers ({markers.filter((m) => m.type === "farmer").length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="font-semibold text-gray-700">Depots ({markers.filter((m) => m.type === "center").length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
            <span className="font-semibold text-gray-700">Buyers ({markers.filter((m) => m.type === "buyer").length})</span>
          </div>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="card p-4 flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input text-sm py-2 max-w-xs"
        >
          <option value="all">Show All Markers</option>
          <option value="farmer">Farmers Only</option>
          <option value="center">Collection Depots Only</option>
          <option value="buyer">Buyers Only</option>
        </select>
      </div>

      {/* Map Container */}
      <div className="card p-2 shadow-lg">
        <LeafletMap
          center={[19.076, 74.5]}
          zoom={7}
          markers={filteredMarkers}
          className="h-[600px] w-full rounded-2xl overflow-hidden"
        />
      </div>
    </div>
  );
}
