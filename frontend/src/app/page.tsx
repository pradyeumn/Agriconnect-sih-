"use client";

import Link from "next/link";
import { Sprout, Users, ShoppingCart, BarChart3, MapPin, Shield, Zap, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "Outfit" }}>AgriConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-outline">Sign In</Link>
            <Link href="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient text-white pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold">Smart Agricultural Supply Chain</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Connecting Farmers to
            <br />
            <span className="text-yellow-300">Better Markets</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            AgriConnect uses AI-powered smart allocation to match farmers with procurement opportunities, eliminate middlemen, and get fair prices for every harvest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn btn-lg" style={{ background: "white", color: "#16a34a" }}>
              Start Free Today
            </Link>
            <Link href="/login" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.4)" }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Farmers", value: "5,000+", icon: "🌾" },
              { label: "Procurement Value", value: "₹50Cr+", icon: "💰" },
              { label: "Collection Centers", value: "200+", icon: "🏭" },
              { label: "States Covered", value: "12", icon: "🗺️" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-white rounded-2xl shadow-sm">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-green-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-gray-500 text-lg">One platform for farmers, buyers, and administrators</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sprout className="w-7 h-7 text-green-600" />,
                bg: "bg-green-50",
                title: "Farmer Dashboard",
                desc: "Manage inventory, track orders, confirm procurement slots with a simple mobile-first interface.",
              },
              {
                icon: <ShoppingCart className="w-7 h-7 text-blue-600" />,
                bg: "bg-blue-50",
                title: "Marketplace",
                desc: "Buyers can discover nearby farmers, filter by crop, grade, and price, and place orders instantly.",
              },
              {
                icon: <MapPin className="w-7 h-7 text-red-600" />,
                bg: "bg-red-50",
                title: "Location Intelligence",
                desc: "Live maps showing farmers, buyers, and collection centers with distance-based filtering.",
              },
              {
                icon: <Zap className="w-7 h-7 text-yellow-600" />,
                bg: "bg-yellow-50",
                title: "Smart Allocation",
                desc: "AI-powered matching ranks farmers by distance, inventory, availability, and reliability score.",
              },
              {
                icon: <BarChart3 className="w-7 h-7 text-purple-600" />,
                bg: "bg-purple-50",
                title: "Analytics",
                desc: "Real-time charts for crop-wise demand, location-wise supply, and monthly sales trends.",
              },
              {
                icon: <Shield className="w-7 h-7 text-gray-600" />,
                bg: "bg-gray-50",
                title: "Inventory Safety",
                desc: "Database-level transactions prevent overselling. Quantities are always accurate and consistent.",
              },
            ].map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for everyone in the supply chain</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: "Farmer",
                emoji: "🌾",
                color: "from-green-500 to-green-600",
                features: ["Register with GPS location", "Add crop inventory", "Accept/reject orders", "Confirm procurement slots"],
                link: "/register/farmer",
              },
              {
                role: "Buyer",
                emoji: "🛒",
                color: "from-blue-500 to-blue-600",
                features: ["Browse nearby produce", "Filter by grade & price", "Cart & checkout", "Track order status"],
                link: "/register/buyer",
              },
              {
                role: "Admin",
                emoji: "🏛️",
                color: "from-purple-500 to-purple-600",
                features: ["Manage all users", "Create procurement plans", "Smart farmer allocation", "View analytics & maps"],
                link: "/login",
              },
            ].map((r) => (
              <div key={r.role} className="card overflow-hidden">
                <div className={`bg-gradient-to-br ${r.color} p-6 text-white`}>
                  <div className="text-4xl mb-3">{r.emoji}</div>
                  <h3 className="text-2xl font-bold">{r.role}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {r.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={r.link} className="btn btn-primary w-full" style={{ display: "flex" }}>
                    Get Started as {r.role}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">AgriConnect</span>
          </div>
          <p className="text-sm">© 2026 AgriConnect. Smart Farmer Procurement and Sales Management.</p>
        </div>
      </footer>
    </div>
  );
}
