"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sprout,
  Package,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Award,
  Trash2,
  Edit,
  X,
  Check,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { inventoryApi, analyticsApi, productsApi, ordersApi } from "@/lib/api";

export default function FarmerDashboardPage() {
  const { farmer } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: 1,
    quantity_available: "",
    price_per_unit: "",
    grade: "A",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadFarmerData() {
    setLoading(true);
    try {
      const [overviewRes, invRes, prodRes, ordersRes] = await Promise.all([
        analyticsApi.farmerOverview().catch(() => ({})),
        inventoryApi.list().catch(() => []),
        productsApi.list().catch(() => []),
        ordersApi.list().catch(() => []),
      ]);

      setStats(overviewRes);
      setInventory(invRes || []);
      setProducts(prodRes || []);
      setOrders(ordersRes || []);
      if (prodRes && prodRes.length > 0) {
        setFormData((prev) => ({ ...prev, product_id: prodRes[0].id }));
      }
    } catch (err) {
      console.error("Failed to load farmer data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarmerData();
  }, []);

  // Submit Upload Stack / Inventory Form
  async function handleAddInventory(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.quantity_available || !formData.price_per_unit) {
      alert("Please fill in quantity and price");
      return;
    }
    setSubmitting(true);
    try {
      await inventoryApi.create({
        product_id: Number(formData.product_id),
        quantity_available: Number(formData.quantity_available),
        price_per_unit: Number(formData.price_per_unit),
        grade: formData.grade,
        description: formData.description,
        status: "available",
      });

      alert("🎉 Crop stack uploaded successfully to MongoDB Atlas!");
      setIsModalOpen(false);
      setFormData({
        product_id: products[0]?.id || 1,
        quantity_available: "",
        price_per_unit: "",
        grade: "A",
        description: "",
      });
      loadFarmerData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to upload crop stack");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete Stock Item
  async function handleDeleteInventory(id: number) {
    if (!confirm("Are you sure you want to delete this unsold crop stack?")) return;
    try {
      await inventoryApi.delete(id);
      loadFarmerData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete item");
    }
  }

  // Accept / Reject Order
  async function handleFarmerAction(orderId: number, action: "accept" | "reject") {
    try {
      await ordersApi.farmerAction(orderId, action);
      loadFarmerData();
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${action} order`);
    }
  }

  const totalAvailableQty = inventory.reduce((acc, curr) => acc + (curr.quantity_available || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
              <Sprout className="w-3.5 h-3.5" /> Farmer Produce Portal
            </div>
            <h1 className="text-3xl font-extrabold font-outfit">
              Welcome, {farmer?.name || "Farmer Ramesh"}!
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Farm: <span className="font-semibold text-white">{farmer?.village || "Khed"}, {farmer?.district || "Pune"}</span> • Land: <span className="font-semibold text-white">{farmer?.farm_size || 5.5} Acres</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" /> Upload New Crop Stack
            </button>
            <Link href="/farmer/procurement" className="btn bg-emerald-900/40 hover:bg-emerald-900/60 text-white border border-white/20">
              <Calendar className="w-4 h-4 mr-2" /> Procurement Slots
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Available Crop Stock</p>
              <h3 className="stat-value">{loading ? "..." : `${stats?.available_quantity ?? totalAvailableQty} kg`}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{inventory.length} active produce stacks listed</p>
        </div>

        <div className="stat-card border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Reserved Produce</p>
              <h3 className="stat-value">{loading ? "..." : `${stats?.reserved_quantity ?? 0} kg`}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Locked in active buyer orders</p>
        </div>

        <div className="stat-card border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Sold Produce Stock</p>
              <h3 className="stat-value">{loading ? "..." : `${stats?.sold_quantity ?? 0} kg`}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">Completed fulfillments</p>
        </div>

        <div className="stat-card border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Reliability Score</p>
              <h3 className="stat-value">{farmer?.reliability_score || 85} / 100</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">★ Verified Top Quality Farmer</p>
        </div>
      </div>

      {/* Main Section 1: My Crop Inventory Stacks */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-outfit">My Active Produce Stacks & Inventory</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload your harvested crop stacks so buyers can view and purchase them in real time.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-xs font-bold shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Upload Crop Stack
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <th className="p-4">Stack ID</th>
                <th className="p-4">Crop Produce</th>
                <th className="p-4">Available Qty</th>
                <th className="p-4">Price / Unit</th>
                <th className="p-4">Quality Grade</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-50/30 transition">
                  <td className="p-4 font-mono font-bold text-gray-900">#{item.id}</td>
                  <td className="p-4 font-semibold text-emerald-800">{item.product?.name || "Crop Produce"}</td>
                  <td className="p-4 font-bold text-gray-900">{item.quantity_available} {item.product?.unit || "kg"}</td>
                  <td className="p-4 font-bold text-emerald-600">₹{item.price_per_unit} / {item.product?.unit || "kg"}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {item.grade || "Grade A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === "available"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "reserved"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteInventory(item.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete unsold stack"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                    You have not uploaded any crop stacks yet. Click "Upload New Crop Stack" to add produce!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Section 2: Received Orders from Buyers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 font-outfit">Received Buyer Purchase Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Accept or reject incoming buyer orders for your stock.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Buyer Name</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Delivery Address</th>
                <th className="p-4">Farmer Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-emerald-50/30 transition">
                  <td className="p-4 font-mono font-bold text-gray-900">#{order.id}</td>
                  <td className="p-4 font-semibold text-gray-900">{order.buyer_name || `Buyer #${order.buyer_id}`}</td>
                  <td className="p-4 font-bold text-emerald-600">₹{order.total_amount?.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-gray-500 max-w-xs truncate">{order.delivery_address || "Main Market"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        order.farmer_status === "accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.farmer_status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.farmer_status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.farmer_status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleFarmerAction(order.id, "accept")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow"
                        >
                          <Check className="w-3 h-3" /> Accept Order
                        </button>
                        <button
                          onClick={() => handleFarmerAction(order.id, "reject")}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold text-[10px] flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                    No buyer orders received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Crop Stack Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-outfit">Upload New Crop Stack</h3>
                <p className="text-xs text-gray-500">Post your available produce to MongoDB Atlas marketplace</p>
              </div>
            </div>

            <form onSubmit={handleAddInventory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Crop Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category} - unit: {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 500"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price per Unit (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 25"
                    value={formData.price_per_unit}
                    onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quality Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Fair)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fresh red harvest from organic farm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-xs font-bold px-6 shadow-md"
                >
                  {submitting ? "Uploading..." : "Upload Crop Stack"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
