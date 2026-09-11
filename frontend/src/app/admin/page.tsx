"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  Calendar,
  TrendingUp,
  Building2,
  ShoppingBag,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  X,
  FileText
} from "lucide-react";
import { analyticsApi, farmersApi, buyersApi, inventoryApi, ordersApi } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "farmers" | "buyers" | "inventory" | "orders">("overview");
  const [loading, setLoading] = useState(true);

  // Data lists
  const [farmers, setFarmers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadAdminData() {
    setLoading(true);
    try {
      const overviewRes = await analyticsApi.adminOverview();
      setStats(overviewRes);

      setDataLoading(true);
      const [fData, bData, iData, oData] = await Promise.all([
        farmersApi.list().catch(() => []),
        buyersApi.list().catch(() => []),
        inventoryApi.list().catch(() => []),
        ordersApi.list().catch(() => []),
      ]);

      setFarmers(fData || []);
      setBuyers(bData || []);
      setInventory(iData || []);
      setOrders(oData || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data", err);
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filtered lists based on search
  const filteredFarmers = farmers.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.crops?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBuyers = buyers.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInventory = inventory.filter(
    (i) =>
      i.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.grade?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(o.id).includes(searchQuery) ||
      o.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> MongoDB Atlas Connected Platform
            </div>
            <h1 className="text-3xl font-extrabold font-outfit">Admin Control & Data Center</h1>
            <p className="text-gray-300 text-sm mt-1 max-w-xl">
              Monitor platform farmers, wholesale buyer networks, live crop inventory stacks, and order fulfillments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadAdminData}
              className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Live Data
            </button>
            <Link href="/admin/allocations" className="btn btn-primary text-xs shadow-emerald-900/50">
              <TrendingUp className="w-3.5 h-3.5 mr-2" /> Smart Allocation
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Total Farmers</p>
              <h3 className="stat-value">{loading ? "..." : stats?.total_farmers ?? farmers.length}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active growers in MongoDB
          </p>
        </div>

        <div className="stat-card border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Total Wholesale Buyers</p>
              <h3 className="stat-value">{loading ? "..." : stats?.total_buyers ?? buyers.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Store className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Verified buyer accounts</p>
        </div>

        <div className="stat-card border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Total Inventory Stacks</p>
              <h3 className="stat-value">{loading ? "..." : stats?.total_inventory ?? inventory.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Active farmer crop listings</p>
        </div>

        <div className="stat-card border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Total Completed Trade Value</p>
              <h3 className="stat-value">
                ₹{loading ? "..." : (stats?.total_sales ?? 0).toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total fulfilled order volume</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Overview & Modules
          </button>
          <button
            onClick={() => setActiveTab("farmers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "farmers"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Farmers Data ({farmers.length})
          </button>
          <button
            onClick={() => setActiveTab("buyers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "buyers"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Buyers Network ({buyers.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "inventory"
                ? "bg-amber-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Package className="w-3.5 h-3.5" /> All Inventory Stacks ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Orders ({orders.length})
          </button>
        </div>

        {activeTab !== "overview" && (
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Tab Content 1: Overview Modules */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 font-outfit">Core Platform Management Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/allocations"
              className="card p-6 hover:border-emerald-500 transition group hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition">
                  Smart Allocation Engine
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Run weighted scoring algorithms (40% distance, 30% quantity, 20% slot capacity, 10% reliability) to match farmers with intake slots.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-emerald-600">
                Run Allocation Algorithm <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/admin/procurement"
              className="card p-6 hover:border-blue-500 transition group hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Procurement & Slot Planning
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Create institutional crop procurement requests, assign target quantities, and create collection center intake slots.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-blue-600">
                Manage Requirements & Slots <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/admin/map"
              className="card p-6 hover:border-amber-500 transition group hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition">
                  Spatial GIS Map & Centers
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Interactive spatial map visualizer showing farmer crop clusters, collection centers, and buyer fulfillment locations.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-amber-600">
                Open Spatial Map <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Tab Content 2: All Farmers Data */}
      {activeTab === "farmers" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 font-outfit">Registered Farmers Master List</h3>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
              {filteredFarmers.length} Farmers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <th className="p-4">ID</th>
                  <th className="p-4">Farmer Name</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Location / District</th>
                  <th className="p-4">Farm Size</th>
                  <th className="p-4">Crops Grown</th>
                  <th className="p-4">Reliability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredFarmers.map((f) => (
                  <tr key={f.id} className="hover:bg-emerald-50/30 transition">
                    <td className="p-4 font-mono font-bold text-gray-900">#{f.id}</td>
                    <td className="p-4 font-semibold text-gray-900">{f.name}</td>
                    <td className="p-4">{f.phone}</td>
                    <td className="p-4">{f.village ? `${f.village}, ` : ""}{f.district || f.state || "India"}</td>
                    <td className="p-4 font-medium">{f.farm_size ? `${f.farm_size} Acres` : "N/A"}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {f.crops || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-amber-600">★ {f.reliability_score || 75}/100</span>
                    </td>
                  </tr>
                ))}
                {filteredFarmers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                      No farmers found matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: All Buyers Network */}
      {activeTab === "buyers" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 font-outfit">Wholesale Buyer Network</h3>
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              {filteredBuyers.length} Buyers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <th className="p-4">ID</th>
                  <th className="p-4">Buyer Company Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">City / Region</th>
                  <th className="p-4">Delivery Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredBuyers.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50/30 transition">
                    <td className="p-4 font-mono font-bold text-gray-900">#{b.id}</td>
                    <td className="p-4 font-semibold text-gray-900">{b.name}</td>
                    <td className="p-4">{b.phone || "N/A"}</td>
                    <td className="p-4 font-medium">{b.city || b.state || "India"}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{b.address || "Main Market"}</td>
                  </tr>
                ))}
                {filteredBuyers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 text-xs">
                      No buyers found matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 4: All Inventory Stacks */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 font-outfit">All Farmers Crop Stacks & Inventory</h3>
            <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
              {filteredInventory.length} Active Stacks
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <th className="p-4">Stack ID</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Crop Produce</th>
                  <th className="p-4">Available Qty</th>
                  <th className="p-4">Reserved / Sold</th>
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredInventory.map((i) => (
                  <tr key={i.id} className="hover:bg-amber-50/30 transition">
                    <td className="p-4 font-mono font-bold text-gray-900">#{i.id}</td>
                    <td className="p-4 font-semibold text-gray-900">{i.farmer_name || `Farmer #${i.farmer_id}`}</td>
                    <td className="p-4 font-medium text-emerald-700">{i.product?.name || "Crop Produce"}</td>
                    <td className="p-4 font-bold text-gray-900">{i.quantity_available} {i.product?.unit || "kg"}</td>
                    <td className="p-4 text-gray-500">
                      Res: {i.quantity_reserved || 0} | Sold: {i.quantity_sold || 0}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">₹{i.price_per_unit} / {i.product?.unit || "kg"}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold text-[10px]">
                        {i.grade || "Grade A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          i.status === "available"
                            ? "bg-emerald-100 text-emerald-800"
                            : i.status === "reserved"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400 text-xs">
                      No produce inventory found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 5: All Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 font-outfit">Platform Purchase Orders</h3>
            <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
              {filteredOrders.length} Orders
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Buyer Name</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Farmer Status</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4">Delivery Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-purple-50/30 transition">
                    <td className="p-4 font-mono font-bold text-gray-900">#{o.id}</td>
                    <td className="p-4 font-semibold text-gray-900">{o.buyer_name || `Buyer #${o.buyer_id}`}</td>
                    <td className="p-4 font-bold text-emerald-600">₹{o.total_amount?.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          o.farmer_status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.farmer_status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.farmer_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{o.delivery_address || "Main Market"}</td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
