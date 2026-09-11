"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, CheckCircle, Clock, FileText, AlertCircle } from "lucide-react";
import { procurementApi, productsApi, formatErrorMessage } from "@/lib/api";
import { Procurement, Product } from "@/types";
import toast from "react-hot-toast";

export default function AdminProcurementPage() {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: 1,
    required_quantity: 500,
    required_by_date: "2026-10-15",
    description: "Kharif harvest bulk procurement requirement",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [procRes, prodRes] = await Promise.all([
        procurementApi.getAllRequirements(),
        productsApi.getAll(),
      ]);
      setProcurements(procRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      toast.error("Failed to load procurement requirements");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await procurementApi.createRequirement({
        product_id: Number(formData.product_id),
        required_quantity: Number(formData.required_quantity),
        required_by_date: formData.required_by_date,
        description: formData.description,
      });
      toast.success("Procurement requirement created successfully!");
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(formatErrorMessage(err, "Failed to create procurement requirement"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" /> Procurement Requirements Planning
          </h1>
          <p className="text-sm text-gray-500">
            Define target crop procurement volumes and target dates for smart farmer allocation.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Requirement
        </button>
      </div>

      {/* Procurement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading procurement requirements...</div>
        ) : procurements.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No active procurement requirements found.</div>
        ) : (
          procurements.map((p) => (
            <div key={p.id} className="card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-blue">{p.product?.category || "Crop"}</span>
                  <span
                    className={`badge ${
                      p.status === "active" ? "badge-emerald" : p.status === "completed" ? "badge-purple" : "badge-amber"
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{p.product?.name || `Product #${p.product_id}`}</h3>
                <p className="text-xs text-gray-500 mt-1">{p.description || "No description provided."}</p>

                <div className="mt-4 p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Required Target Volume:</span>
                    <span className="font-bold text-gray-900">{p.required_quantity} Quintals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Required By Date:</span>
                    <span className="font-bold text-blue-700">{p.required_by_date}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t text-[11px] text-gray-400 flex justify-between">
                <span>Procurement ID #{p.id}</span>
                <span>Slots Allocated: {p.slots?.length || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-xl font-bold font-outfit text-gray-900">Create Procurement Requirement</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Crop Produce</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: Number(e.target.value) })}
                  className="input"
                  required
                >
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Required Quantity (Quintals)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.required_quantity}
                  onChange={(e) => setFormData({ ...formData, required_quantity: Number(e.target.value) })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={formData.required_by_date}
                  onChange={(e) => setFormData({ ...formData, required_by_date: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description / Guidelines</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Create Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
