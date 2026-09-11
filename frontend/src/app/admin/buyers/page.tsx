"use client";

import { useState, useEffect } from "react";
import { Store, Phone, MapPin, Search } from "lucide-react";
import { buyersApi } from "@/lib/api";
import { Buyer } from "@/types";
import toast from "react-hot-toast";

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadBuyers() {
      try {
        const res = await buyersApi.getAll();
        setBuyers(res.data);
      } catch (err) {
        toast.error("Failed to load buyers list");
      } finally {
        setLoading(false);
      }
    }
    loadBuyers();
  }, []);

  const filteredBuyers = buyers.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <Store className="w-7 h-7 text-blue-600" /> Verified Buyer Directory
        </h1>
        <p className="text-sm text-gray-500">
          List of wholesale buyers, food processing businesses, and retail chains purchasing produce.
        </p>
      </div>

      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search buyers by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading buyers...</div>
        ) : filteredBuyers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No buyers registered yet.</div>
        ) : (
          filteredBuyers.map((b) => (
            <div key={b.id} className="card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{b.name}</h3>
                    <span className="badge badge-buyer">Verified Buyer</span>
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-xs text-gray-600">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600" /> {b.phone}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{b.address || "No address specified"}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t text-[11px] text-gray-400 flex justify-between">
                <span>GPS: {b.latitude?.toFixed(4)}, {b.longitude?.toFixed(4)}</span>
                <span>Buyer ID #{b.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
