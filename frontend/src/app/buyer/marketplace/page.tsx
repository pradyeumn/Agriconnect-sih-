"use client";

import { useState, useEffect } from "react";
import { Store, Search, Filter, ShoppingCart, Check, MapPin, Award, Sprout, Plus } from "lucide-react";
import { inventoryApi } from "@/lib/api";
import { InventoryItem } from "@/types";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";

export default function BuyerMarketplacePage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const { addToCart, items: cartItems } = useCart();

  useEffect(() => {
    loadMarketplace();
  }, []);

  const loadMarketplace = async () => {
    try {
      const res = await inventoryApi.getAll();
      setItems(res.data || []);
    } catch (err) {
      toast.error("Failed to load produce marketplace");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", "Vegetables", "Grains", "Pulses", "Fruits", "Spices"];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmer?.district?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      item.product?.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesGrade = selectedGrade === "all" || item.grade === selectedGrade;
    return matchesSearch && matchesCat && matchesGrade && item.quantity_available > 0;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <Store className="w-7 h-7 text-blue-600" /> Fresh Farm Produce Marketplace
        </h1>
        <p className="text-sm text-gray-500">
          Source farm-fresh certified produce directly from local farmers at transparent prices.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {cat === "all" ? "All Produce Categories" : cat}
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search crop, farmer name, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Quality Grades</option>
            <option value="Grade A">Grade A (Premium)</option>
            <option value="Grade B">Grade B (Standard)</option>
            <option value="Grade C">Grade C (Processing)</option>
          </select>
        </div>
      </div>

      {/* Marketplace Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading marketplace produce...</div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No produce matching filters.</div>
        ) : (
          filteredItems.map((item) => {
            const inCart = cartItems.some((ci) => ci.inventory_id === item.id);

            return (
              <div key={item.id} className="card p-6 flex flex-col justify-between space-y-4 hover:shadow-xl transition group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge badge-blue">{item.product?.category}</span>
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

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                    {item.product?.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.product?.description}</p>

                  <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Farmer:</span>
                      <span className="font-bold text-gray-900">{item.farmer?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {item.farmer?.district}, {item.farmer?.state}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Stock Available:</span>
                      <span className="font-extrabold text-blue-700 text-sm">{item.quantity_available} Quintals</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
                      <span className="text-gray-600 font-medium">Price:</span>
                      <span className="text-lg font-extrabold text-gray-900">₹{item.price_per_unit} <span className="text-xs text-gray-500 font-normal">/ Qtl</span></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(item, 1)}
                  className={`btn w-full py-3 text-sm flex items-center justify-center gap-2 ${
                    inCart
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "btn-secondary"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart (+1 Qtl)
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Order Cart
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
