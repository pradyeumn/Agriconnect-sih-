"use client";

import dynamic from "next/dynamic";

const LeafletMapClient = dynamic(() => import("./LeafletMapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center border border-emerald-100 p-6 text-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-semibold text-emerald-800">Loading Interactive Map...</p>
      <p className="text-xs text-emerald-600">OpenStreetMap & Leaflet spatial engine</p>
    </div>
  ),
});

export default LeafletMapClient;
