"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sprout, Package, Calendar, ShoppingBag, TrendingUp, Plus, ArrowUpRight, Award, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { inventoryApi, procurementApi } from "@/lib/api";

export default function FarmerDashboardPage() {
  const { farmer } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarmerData() {
      try {
        const [invRes, allocRes] = await Promise.all([
          inventoryApi.getAll(),
          procurementApi.getFarmerAllocations(),
        ]);
        setInventory(invRes.data || []);
        setAllocations(allocRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFarmerData();
  }, []);

  const totalQuintals = inventory.reduce((acc, curr) => acc + (curr.quantity_available || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
              <Sprout className="w-3.5 h-3.5" /> Farmer Portal
            </div>
            <h1 className="text-3xl font-extrabold font-outfit">
              Welcome back, {farmer?.name || "Farmer Ramesh"}!
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Farm: <span className="font-semibold text-white">{farmer?.village || "Khed"}, {farmer?.district || "Pune"}</span> • Land: <span className="font-semibold text-white">{farmer?.farm_size || 5.5} Acres</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/farmer/inventory" className="btn bg-white text-emerald-800 hover:bg-emerald-50 font-bold">
              <Plus className="w-4 h-4 mr-2" /> Add Crop Produce
            </Link>
            <Link href="/farmer/procurement" className="btn bg-emerald-900/40 hover:bg-emerald-900/60 text-white border border-white/20">
              <Calendar className="w-4 h-4 mr-2" /> View Procurement Slots
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Listed Inventory Produce</p>
              <h3 className="stat-value">{loading ? "..." : `${totalQuintals} Qtl`}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{inventory.length} produce batches listed</p>
        </div>

        <div className="stat-card border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Allocated Center Slots</p>
              <h3 className="stat-value">{loading ? "..." : allocations.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Government intake allocations</p>
        </div>

        <div className="stat-card border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Reliability Score</p>
              <h3 className="stat-value">{farmer?.reliability_score || 85} / 100</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">★ Top Tier Verified Farmer</p>
        </div>

        <div className="stat-card border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Total Sales Earnings</p>
              <h3 className="stat-value">₹1,45,000</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Direct & procurement payouts</p>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/farmer/inventory" className="card p-6 hover:border-emerald-500 transition group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition">My Produce Inventory</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              List new harvested crops, set prices per quintal, quality grade (Grade A/B), and manage available quantities.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-emerald-600">
            Manage Crop Inventory <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link href="/farmer/procurement" className="card p-6 hover:border-indigo-500 transition group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">Procurement Slot Allocations</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Check if the Smart Allocation Engine has matched your produce with nearby collection center intake slots.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-indigo-600">
            Confirm Intake Slots <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link href="/farmer/orders" className="card p-6 hover:border-purple-500 transition group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition">Direct Buyer Orders</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              View purchase orders placed directly by wholesale buyers and processors in the marketplace.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-purple-600">
            View Buyer Orders <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
