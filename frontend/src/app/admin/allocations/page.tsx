"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Play, Award, MapPin, Package, Check, X, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { procurementApi, formatErrorMessage } from "@/lib/api";
import { ProcurementSlot, SlotAllocation } from "@/types";
import toast from "react-hot-toast";

export default function AdminAllocationsPage() {
  const [slots, setSlots] = useState<ProcurementSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [rankedResults, setRankedResults] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<SlotAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningAlg, setRunningAlg] = useState(false);

  useEffect(() => {
    loadSlots();
    loadAllocations();
  }, []);

  const loadSlots = async () => {
    try {
      const res = await procurementApi.getAllSlots();
      setSlots(res.data);
      if (res.data.length > 0) {
        setSelectedSlotId(res.data[0].id);
      }
    } catch (err) {
      toast.error("Failed to load slots");
    }
  };

  const loadAllocations = async () => {
    try {
      const res = await procurementApi.getAllAllocations();
      setAllocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAlgorithm = async () => {
    if (!selectedSlotId) {
      toast.error("Please select a procurement slot first");
      return;
    }

    setRunningAlg(true);
    try {
      const res = await procurementApi.runSmartAllocation(selectedSlotId);
      const rankedList = Array.isArray(res) ? res : (res?.ranked_farmers || res?.data || []);
      setRankedResults(rankedList);
      toast.success(`Smart allocation algorithm finished! Ranked ${rankedList.length} candidate farmers.`);
    } catch (err: any) {
      toast.error(formatErrorMessage(err, "Failed to run allocation engine"));
    } finally {
      setRunningAlg(false);
    }
  };

  const handleApproveAllocation = async (allocationId: number) => {
    try {
      await procurementApi.approveAllocation(allocationId);
      toast.success("Farmer allocation approved!");
      loadAllocations();
    } catch (err: any) {
      toast.error(formatErrorMessage(err, "Failed to approve allocation"));
    }
  };

  const handleRejectAllocation = async (allocationId: number) => {
    try {
      await procurementApi.rejectAllocation(allocationId);
      toast.success("Farmer allocation rejected");
      loadAllocations();
    } catch (err: any) {
      toast.error("Failed to reject allocation");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Haversine Distance + Quality Score Formula
            </div>
            <h1 className="text-3xl font-extrabold font-outfit">Smart Farmer Allocation Engine</h1>
            <p className="mt-2 text-emerald-100 text-sm max-w-2xl">
              Calculates a multi-factor score (0-100) combining distance to collection center (40%), crop volume match (30%), slot availability (20%), and farmer reliability rating (10%).
            </p>
          </div>

          <button
            onClick={handleRunAlgorithm}
            disabled={runningAlg || !selectedSlotId}
            className="btn bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-6 py-3.5 text-base shadow-xl flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Play className={`w-5 h-5 fill-emerald-800 ${runningAlg ? "animate-spin" : ""}`} />
            {runningAlg ? "Computing Ranked Matrix..." : "Run Smart Allocation Engine"}
          </button>
        </div>
      </div>

      {/* Select Slot Dropdown */}
      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Active Procurement Slot Target</label>
          <select
            value={selectedSlotId || ""}
            onChange={(e) => setSelectedSlotId(Number(e.target.value))}
            className="input font-semibold text-gray-900 min-w-[300px]"
          >
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                Slot #{slot.id} - {slot.collection_center?.name} ({slot.procurement?.product?.name} on {slot.date})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100">
          <div>
            <span className="font-semibold text-emerald-900">Distance Weight:</span> 40%
          </div>
          <div>
            <span className="font-semibold text-emerald-900">Quantity Weight:</span> 30%
          </div>
          <div>
            <span className="font-semibold text-emerald-900">Availability:</span> 20%
          </div>
          <div>
            <span className="font-semibold text-emerald-900">Reliability:</span> 10%
          </div>
        </div>
      </div>

      {/* Ranked Engine Results Section */}
      {rankedResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" /> Ranked Candidate Farmers for Slot #{selectedSlotId}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rankedResults.map((r, idx) => (
              <div
                key={r.farmer_id}
                className={`card p-6 flex flex-col justify-between relative overflow-hidden ${
                  idx === 0 ? "border-2 border-emerald-500 bg-emerald-50/30 shadow-md" : ""
                }`}
              >
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    #1 Top Match Candidate
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <h3 className="font-bold text-gray-900">{r.farmer_name || `Farmer #${r.farmer_id}`}</h3>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-700 font-mono">
                      {(r.score ?? r.allocation_score ?? 85.0).toFixed(1)} / 100
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Distance to Center:</span>
                      <span className="font-semibold text-gray-800">{(r.distance_km ?? 0.0).toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Available Crop Volume:</span>
                      <span className="font-semibold text-emerald-700">{r.available_quantity ?? 0} Quintals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Recommended Allocation:</span>
                      <span className="font-bold text-indigo-700">
                        {r.recommended_allocation ?? r.recommended_quantity ?? 0} Quintals
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Farmer Reliability Score:</span>
                      <span className="font-semibold text-amber-700">
                        {r.farmer_reliability ?? r.reliability_score ?? 75} / 100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t text-xs flex items-center justify-between">
                  <span className="text-gray-500">Farmer ID #{r.farmer_id}</span>
                  <span className="badge badge-emerald">Algorithm Calculated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Allocations Management Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-600" /> Active Slot Allocations & Admin Approvals
        </h2>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Allocation ID</th>
                <th>Target Slot & Center</th>
                <th>Farmer Name</th>
                <th>Allocated Quantity</th>
                <th>Rank Score</th>
                <th>Status</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No active slot allocations recorded. Click "Run Smart Allocation Engine" above.
                  </td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-gray-700">#{alloc.id}</span>
                    </td>
                    <td>
                      <div className="text-xs font-bold text-gray-800">
                        {alloc.slot?.collection_center?.name || `Slot #${alloc.slot_id}`}
                      </div>
                      <div className="text-[11px] text-gray-500">{alloc.slot?.date}</div>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-gray-900">{alloc.farmer?.name || `Farmer #${alloc.farmer_id}`}</div>
                      <div className="text-[11px] text-gray-500">{alloc.farmer?.district}</div>
                    </td>
                    <td>
                      <span className="font-bold text-emerald-700">{alloc.allocated_quantity} Quintals</span>
                    </td>
                    <td>
                      <span className="badge badge-amber font-mono">{alloc.allocation_score?.toFixed(1) || 85.0}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          alloc.status === "approved"
                            ? "badge-emerald"
                            : alloc.status === "confirmed"
                            ? "badge-indigo"
                            : alloc.status === "rejected"
                            ? "badge-red"
                            : "badge-amber"
                        }`}
                      >
                        {alloc.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {alloc.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveAllocation(alloc.id)}
                            className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectAllocation(alloc.id)}
                            className="btn bg-red-100 text-red-700 hover:bg-red-200 text-xs py-1 px-3 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Decided</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
