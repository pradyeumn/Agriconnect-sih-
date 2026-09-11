"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  ShoppingCart,
  ShoppingBag,
  MapPin,
  Search,
  ArrowUpRight,
  Sparkles,
  Package,
  CheckCircle2,
  X,
  CreditCard,
  Check,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { inventoryApi, analyticsApi, ordersApi } from "@/lib/api";

export default function BuyerDashboardPage() {
  const { buyer } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Buy Out Modal State
  const [buyModalItem, setBuyModalItem] = useState<any>(null);
  const [buyQty, setBuyQty] = useState<number>(10);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [purchasing, setPurchasing] = useState(false);

  async function loadBuyerData() {
    setLoading(true);
    try {
      const [overviewRes, invRes, ordersRes] = await Promise.all([
        analyticsApi.buyerOverview().catch(() => ({})),
        inventoryApi.list().catch(() => []),
        ordersApi.list().catch(() => []),
      ]);

      setStats(overviewRes);
      setInventory(invRes || []);
      setMyOrders(ordersRes || []);
    } catch (err) {
      console.error("Failed to load buyer data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBuyerData();
  }, []);

  function handleOpenBuyModal(item: any) {
    setBuyModalItem(item);
    setBuyQty(Math.min(10, item.quantity_available || 1));
    setDeliveryAddress(buyer?.address || "Main Market Yard, Pune");
  }

  async function handleConfirmBuyOut(e: React.FormEvent) {
    e.preventDefault();
    if (!buyModalItem || buyQty <= 0) return;

    if (buyQty > buyModalItem.quantity_available) {
      alert(`Cannot purchase more than available quantity (${buyModalItem.quantity_available})`);
      return;
    }

    setPurchasing(true);
    try {
      await ordersApi.place({
        items: [
          {
            inventory_id: buyModalItem.id,
            quantity: Number(buyQty),
          },
        ],
        delivery_address: deliveryAddress,
      });

      alert(`🎉 Purchase successful! Order placed and ${buyQty} ${buyModalItem.product?.unit || "kg"} deducted from farmer stock in real-time.`);
      setBuyModalItem(null);
      loadBuyerData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to place order");
    } finally {
      setPurchasing(false);
    }
  }

  const categories = ["all", "vegetable", "fruit", "grain", "leafy vegetable"];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmer_location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.product?.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory && item.status === "available" && item.quantity_available > 0;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Certified Farm Direct Sourcing
            </div>
            <h1 className="text-3xl font-extrabold font-outfit">
              Welcome, {buyer?.name || "Wholesale Buyer"}!
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Source fresh, graded crops directly from verified local farmers with transparent pricing and real-time inventory updates.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadBuyerData}
              className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Inventory
            </button>
            <Link href="/buyer/orders" className="btn bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs">
              <ShoppingBag className="w-4 h-4 mr-2" /> View My Orders ({myOrders.length})
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="stat-card border-l-4 border-l-blue-500">
          <p className="stat-label">Total Orders Placed</p>
          <h3 className="stat-value">{loading ? "..." : stats?.total_orders ?? myOrders.length}</h3>
          <p className="text-xs text-gray-500 mt-2">Active & completed trades</p>
        </div>

        <div className="stat-card border-l-4 border-l-amber-500">
          <p className="stat-label">Active Orders</p>
          <h3 className="stat-value">{loading ? "..." : stats?.active_orders ?? 0}</h3>
          <p className="text-xs text-amber-600 font-semibold mt-2">Pending farmer delivery</p>
        </div>

        <div className="stat-card border-l-4 border-l-emerald-500">
          <p className="stat-label">Completed Fulfillments</p>
          <h3 className="stat-value">{loading ? "..." : stats?.completed_orders ?? 0}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-2">Successfully delivered</p>
        </div>

        <div className="stat-card border-l-4 border-l-purple-500">
          <p className="stat-label">Total Spent Value</p>
          <h3 className="stat-value">₹{loading ? "..." : (stats?.total_spent ?? 0).toLocaleString("en-IN")}</h3>
          <p className="text-xs text-gray-500 mt-2">Total procurement budget</p>
        </div>
      </div>

      {/* Marketplace Header & Search Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-outfit">Live Farmer Crop Produce Inventory</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Browse available crop stacks listed directly by farmers. Buy out stock instantly to trigger real-time inventory updates.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search crop or farmer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live Produce Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <div
            key={item.id}
            className="card p-6 border hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase">
                  {item.product?.category || "Produce"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                  {item.grade ? `Grade ${item.grade}` : "Grade A"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 font-outfit">{item.product?.name || "Crop Produce"}</h3>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium text-gray-700">{item.farmer_name || "Farmer"}</span> ({item.farmer_location || "India"})
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Available Stock:</span>
                  <span className="font-bold text-gray-900">{item.quantity_available} {item.product?.unit || "kg"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price per Unit:</span>
                  <span className="font-bold text-emerald-600">₹{item.price_per_unit} / {item.product?.unit || "kg"}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Value</p>
                <p className="text-sm font-bold text-gray-900">
                  ₹{(item.quantity_available * item.price_per_unit).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                onClick={() => handleOpenBuyModal(item)}
                className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md"
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Buy Produce Now
              </button>
            </div>
          </div>
        ))}

        {filteredInventory.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-700">No Crop Stacks Available</h4>
            <p className="text-xs text-gray-400 mt-1">
              Try clearing search filters or check back when farmers upload new crop inventory.
            </p>
          </div>
        )}
      </div>

      {/* Buy Out Direct Modal */}
      {buyModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setBuyModalItem(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-outfit">Buy Produce from Farmer</h3>
                <p className="text-xs text-gray-500">Real-time stock deduction from MongoDB Atlas</p>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 mb-5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Produce:</span>
                <span className="font-bold text-gray-900">{buyModalItem.product?.name} ({buyModalItem.grade || "Grade A"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Farmer:</span>
                <span className="font-bold text-gray-900">{buyModalItem.farmer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Available Stock:</span>
                <span className="font-bold text-emerald-600">{buyModalItem.quantity_available} {buyModalItem.product?.unit || "kg"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price per Unit:</span>
                <span className="font-bold text-blue-600">₹{buyModalItem.price_per_unit} / {buyModalItem.product?.unit || "kg"}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBuyOut} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Quantity to Purchase ({buyModalItem.product?.unit || "kg"})
                </label>
                <input
                  type="number"
                  min={1}
                  max={buyModalItem.quantity_available}
                  value={buyQty}
                  onChange={(e) => setBuyQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs mt-2">
                <span>Total Payment Amount:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  ₹{(buyQty * buyModalItem.price_per_unit).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBuyModalItem(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchasing}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 shadow-md"
                >
                  {purchasing ? "Processing Purchase..." : "Confirm & Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
