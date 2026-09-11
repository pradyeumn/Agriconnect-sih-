"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, Calendar, Building2, CheckCircle2, Clock } from "lucide-react";
import { procurementApi, collectionCentersApi } from "@/lib/api";
import { ProcurementSlot, CollectionCenter, Procurement } from "@/types";
import toast from "react-hot-toast";

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<ProcurementSlot[]>([]);
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [centers, setCenters] = useState<CollectionCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    procurement_id: 1,
    collection_center_id: 1,
    date: "2026-10-20",
    capacity: 250,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [slotRes, procRes, centerRes] = await Promise.all([
        procurementApi.getAllSlots(),
        procurementApi.getAllRequirements(),
        collectionCentersApi.getAll(),
      ]);
      setSlots(slotRes.data);
      setProcurements(procRes.data);
      setCenters(centerRes.data);
    } catch (err) {
      toast.error("Failed to load procurement slots");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await procurementApi.createSlot({
        procurement_id: Number(formData.procurement_id),
        collection_center_id: Number(formData.collection_center_id),
        date: formData.date,
        capacity: Number(formData.capacity),
      });
      toast.success("Procurement slot created!");
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error("Failed to create slot");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" /> Collection Center Procurement Slots
          </h1>
          <p className="text-sm text-gray-500">
            Assign intake dates and intake capacity quotas at collection centers for smart farmer allocation.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Procurement Slot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading procurement slots...</div>
        ) : slots.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No procurement slots created yet.</div>
        ) : (
          slots.map((s) => (
            <div key={s.id} className="card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-indigo">Slot #{s.id}</span>
                  <span className={`badge ${s.status === "open" ? "badge-emerald" : "badge-amber"}`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  {s.collection_center?.name || `Center #${s.collection_center_id}`}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Crop: <span className="font-semibold text-gray-800">{s.procurement?.product?.name || `Procurement #${s.procurement_id}`}</span>
                </p>

                <div className="mt-4 p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slot Intake Date:</span>
                    <span className="font-bold text-indigo-700">{s.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slot Capacity:</span>
                    <span className="font-bold text-gray-900">{s.capacity} Quintals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Allocated Quantity:</span>
                    <span className="font-bold text-emerald-700">{s.allocated_quantity} Quintals</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((s.allocated_quantity || 0) / (s.capacity || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t text-[11px] text-gray-400 flex justify-between">
                <span>Center ID #{s.collection_center_id}</span>
                <span>Allocations Count: {s.allocations?.length || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-xl font-bold font-outfit text-gray-900">Create Procurement Slot</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Procurement Requirement</label>
                <select
                  value={formData.procurement_id}
                  onChange={(e) => setFormData({ ...formData, procurement_id: Number(e.target.value) })}
                  className="input"
                  required
                >
                  {procurements.map((p) => (
                    <option key={p.id} value={p.id}>
                      Procurement #{p.id} - {p.product?.name} ({p.required_quantity} Qtl)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Collection Center</label>
                <select
                  value={formData.collection_center_id}
                  onChange={(e) => setFormData({ ...formData, collection_center_id: Number(e.target.value) })}
                  className="input"
                  required
                >
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district || c.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Intake Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Intake Capacity (Quintals)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="input"
                />
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
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
