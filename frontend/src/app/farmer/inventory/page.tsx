"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Trash2, Edit, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { inventoryApi, productsApi } from "@/lib/api";
import { InventoryItem, Product } from "@/types";
import toast from "react-hot-toast";

export default function FarmerInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: 1,
    quantity_available: 100,
    price_per_unit: 2800,
    grade: "Grade A",
    harvest_date: "2026-10-01",
    expiry_date: "2026-11-01",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invRes, prodRes] = await Promise.all([
        inventoryApi.getAll(),
        productsApi.getAll(),
      ]);
      setInventory(invRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.create({
        product_id: Number(formData.product_id),
        quantity_available: Number(formData.quantity_available),
        price_per_unit: Number(formData.price_per_unit),
        grade: formData.grade,
        harvest_date: formData.harvest_date,
        expiry_date: formData.expiry_date,
      });
      toast.success("Crop produce listed successfully in marketplace!");
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create produce listing");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this produce listing?")) return;
    try {
      await inventoryApi.delete(id);
      toast.success("Produce listing removed.");
      loadData();
    } catch (err) {
      toast.error("Failed to delete listing");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-600" /> My Produce Inventory
          </h1>
          <p className="text-sm text-gray-500">
            List harvested crops for government procurement intake and direct wholesale buyers.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Produce Batch
        </button>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No produce listings found. Click "Add Produce Batch" above.</div>
        ) : (
          inventory.map((item) => (
            <div key={item.id} className="card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-emerald">{item.product?.category || "Produce"}</span>
                  <span
                    className={`badge ${
                      item.grade === "Grade A"
                        ? "badge-emerald"
                        : item.grade === "Grade B"
                        ? "badge-blue"
                        : "badge-amber"
                    }`}
                  >
                    {item.grade}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900">{item.product?.name || `Product #${item.product_id}`}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.product?.description}</p>

                <div className="mt-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-medium">Available Quantity:</span>
                    <span className="font-bold text-emerald-800 text-sm">{item.quantity_available} Quintals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-medium">Price per Quintal:</span>
                    <span className="font-extrabold text-gray-900 text-sm">₹{item.price_per_unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-medium">Harvest Date:</span>
                    <span className="font-semibold text-gray-700">{item.harvest_date || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-900 font-medium">Status:</span>
                    <span className="badge badge-emerald">{item.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t text-xs flex items-center justify-between">
                <span className="text-gray-400">Listing ID #{item.id}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Produce Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-xl font-bold font-outfit text-gray-900">List New Harvested Crop Batch</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Crop Type</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({ ...formData, quantity_available: Number(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price per Quintal (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price_per_unit}
                    onChange={(e) => setFormData({ ...formData, price_per_unit: Number(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Quality Grade</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="input"
                >
                  <option value="Grade A">Grade A (Export / Premium)</option>
                  <option value="Grade B">Grade B (Standard Market)</option>
                  <option value="Grade C">Grade C (Processing)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={formData.harvest_date}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
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
                  List Produce Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
