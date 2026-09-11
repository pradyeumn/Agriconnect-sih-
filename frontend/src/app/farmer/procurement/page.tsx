"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, XCircle, Building2, MapPin, Award } from "lucide-react";
import { procurementApi, formatErrorMessage } from "@/lib/api";
import { SlotAllocation } from "@/types";
import toast from "react-hot-toast";

export default function FarmerProcurementPage() {
  const [allocations, setAllocations] = useState<SlotAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllocations();
  }, []);

  const loadAllocations = async () => {
    try {
      const res = await procurementApi.getFarmerAllocations();
      setAllocations(res.data);
    } catch (err) {
      toast.error("Failed to load allocated slots");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (allocationId: number) => {
    try {
      await procurementApi.confirmFarmerAllocation(allocationId);
      toast.success("Slot intake confirmed! Delivery passcode generated.");
      loadAllocations();
    } catch (err: any) {
      toast.error(formatErrorMessage(err, "Failed to confirm slot"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-indigo-600" /> Government Procurement Intake Slots
        </h1>
        <p className="text-sm text-gray-500">
          View slots assigned to your farm by the Smart Allocation Engine and confirm your crop delivery appointment.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading procurement slots...</div>
        ) : allocations.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            No procurement intake slots allocated yet. Make sure your produce is listed in inventory.
          </div>
        ) : (
          allocations.map((alloc) => (
            <div key={alloc.id} className="card p-6 border-l-4 border-l-indigo-600 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-indigo">Allocation #{alloc.id}</span>
                  <span
                    className={`badge ${
                      alloc.status === "confirmed"
                        ? "badge-emerald"
                        : alloc.status === "approved"
                        ? "badge-blue"
                        : alloc.status === "rejected"
                        ? "badge-red"
                        : "badge-amber"
                    }`}
                  >
                    {alloc.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  {alloc.slot?.collection_center?.name || `Depot #${alloc.slot?.collection_center_id}`}
                </h3>

                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {alloc.slot?.collection_center?.address} ({alloc.slot?.collection_center?.district})
                </p>

                <div className="flex flex-wrap gap-4 pt-2 text-xs">
                  <div className="bg-indigo-50 px-3 py-1.5 rounded-lg">
                    <span className="text-indigo-900 font-medium">Intake Date:</span>{" "}
                    <span className="font-bold text-indigo-800">{alloc.slot?.date}</span>
                  </div>
                  <div className="bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <span className="text-emerald-900 font-medium">Allocated Quantity:</span>{" "}
                    <span className="font-bold text-emerald-800">{alloc.allocated_quantity} Quintals</span>
                  </div>
                  <div className="bg-amber-50 px-3 py-1.5 rounded-lg">
                    <span className="text-amber-900 font-medium">Smart Score:</span>{" "}
                    <span className="font-bold text-amber-800">{alloc.allocation_score?.toFixed(1)} / 100</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div>
                {alloc.status === "approved" ? (
                  <button
                    onClick={() => handleConfirm(alloc.id)}
                    className="btn btn-primary px-6 py-3 flex items-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Confirm Delivery Slot
                  </button>
                ) : alloc.status === "confirmed" ? (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-emerald-900">Delivery Confirmed</p>
                    <p className="text-[11px] text-emerald-700">Present code at depot</p>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 font-medium">Awaiting Admin Review</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
