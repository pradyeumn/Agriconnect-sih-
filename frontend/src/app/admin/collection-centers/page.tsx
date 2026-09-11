"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, MapPin, User, CheckCircle } from "lucide-react";
import { collectionCentersApi } from "@/lib/api";
import { CollectionCenter } from "@/types";
import toast from "react-hot-toast";

export default function AdminCollectionCentersPage() {
  const [centers, setCenters] = useState<CollectionCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    district: "Pune",
    state: "Maharashtra",
    latitude: 18.52,
    longitude: 73.85,
    capacity: 2000,
    manager_name: "Sanjay Patil",
    manager_phone: "9823456789",
  });

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const res = await collectionCentersApi.getAll();
      setCenters(res.data);
    } catch (err) {
      toast.error("Failed to load collection centers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await collectionCentersApi.create({
        ...formData,
        capacity: Number(formData.capacity),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      toast.success("Collection Center created successfully!");
      setShowModal(false);
      loadCenters();
    } catch (err: any) {
      toast.error("Failed to create collection center");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-600" /> Government & District Collection Centers
          </h1>
          <p className="text-sm text-gray-500">
            Physical procurement depots where farmers deliver crops during assigned slots.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Collection Center
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading collection centers...</div>
        ) : centers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No collection centers registered yet.</div>
        ) : (
          centers.map((c) => (
            <div key={c.id} className="card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-emerald">Active Depot</span>
                  <span className="text-xs font-mono font-semibold text-gray-400">ID #{c.id}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{c.address} ({c.district}, {c.state})</span>
                </p>

                <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-medium">Total Storage Capacity:</span>
                    <span className="font-bold text-emerald-700">{c.capacity} Quintals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-medium">Manager:</span>
                    <span className="font-semibold text-gray-800">{c.manager_name} ({c.manager_phone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-medium">GPS Location:</span>
                    <span className="font-mono text-emerald-800">{c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-xl font-bold font-outfit text-gray-900">Add Collection Center</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Center Depot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Central Agricultural Depot"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Capacity (Qtl)</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Manager Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.manager_phone}
                    onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Add Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
