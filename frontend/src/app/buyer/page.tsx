"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, ShoppingCart, ShoppingBag, MapPin, Search, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function BuyerDashboardPage() {
  const { buyer } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Certified Farm Sourcing
            </div>
            <h1 className="text-3xl font-extrabold font-outfit">
              Welcome, {buyer?.name || "Wholesale Buyer"}!
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Source fresh, graded crops directly from certified local farmers with transparent pricing, quality certification, and direct farm delivery.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/buyer/marketplace" className="btn bg-white text-blue-900 hover:bg-blue-50 font-bold">
              <Store className="w-4 h-4 mr-2" /> Explore Marketplace
            </Link>
            <Link href="/buyer/cart" className="btn bg-blue-800/40 hover:bg-blue-800/60 text-white border border-white/20">
              <ShoppingCart className="w-4 h-4 mr-2" /> View Cart ({totalItems})
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="stat-card border-l-4 border-l-blue-500">
          <p className="stat-label">Items in Cart</p>
          <h3 className="stat-value">{totalItems} produce items</h3>
          <p className="text-xs text-gray-500 mt-2">Ready for order placement</p>
        </div>

        <div className="stat-card border-l-4 border-l-emerald-500">
          <p className="stat-label">Verified Farmers Near You</p>
          <h3 className="stat-value">18 Farmers</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-2">Within 50 km radius</p>
        </div>

        <div className="stat-card border-l-4 border-l-purple-500">
          <p className="stat-label">Completed Direct Orders</p>
          <h3 className="stat-value">4 Orders</h3>
          <p className="text-xs text-gray-500 mt-2">Total ₹1,85,000 sourced</p>
        </div>
      </div>

      {/* Direct Quick Sourcing Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/buyer/marketplace" className="card p-6 hover:border-blue-500 transition group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">Fresh Crop Marketplace</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Browse tomatoes, wheat, rice, potatoes, onions, and legumes directly listed by verified farmers with Grade A/B quality certification.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-blue-600">
            Open Produce Marketplace <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link href="/buyer/map" className="card p-6 hover:border-emerald-500 transition group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition">Nearby Farmers Map</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Locate nearby farms on the interactive Leaflet map to calculate transport distance and minimize procurement freight cost.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-semibold text-emerald-600">
            View Map Locations <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
