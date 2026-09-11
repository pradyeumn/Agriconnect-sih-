"use client";

import { useState, useEffect } from "react";
import { Package, Search, Filter, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { inventoryApi } from "@/lib/api";
import { InventoryItem } from "@/types";
import toast from "react-hot-toast";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const res = await inventoryApi.getAll();
      setItems(res.data);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmer?.district?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === "all" || item.grade === gradeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <Package className="w-7 h-7 text-amber-600" /> Global Farmer Inventory Monitor
        </h1>
        <p className="text-sm text-gray-500">
          Real-time tracking of crop availability, quantity reserved/sold, quality grades, and pricing across all registered farmers.
        </p>
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search crop, farmer, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Quality Grades</option>
            <option value="Grade A">Grade A (Premium)</option>
            <option value="Grade B">Grade B (Standard)</option>
            <option value="Grade C">Grade C (Processing)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Stock</option>
            <option value="reserved">Reserved / Allocated</option>
            <option value="sold">Sold Out</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Produce / Crop</th>
              <th>Farmer</th>
              <th>Available Qty</th>
              <th>Reserved / Sold</th>
              <th>Price per Qtl</th>
              <th>Quality Grade</th>
              <th>Harvest Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  Loading produce inventory...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No inventory items match search criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-bold text-gray-900">{item.product?.name || `Product #${item.product_id}`}</div>
                    <div className="text-[11px] text-gray-500">{item.product?.category}</div>
                  </td>
                  <td>
                    <div className="text-xs font-semibold text-gray-800">{item.farmer?.name || `Farmer #${item.farmer_id}`}</div>
                    <div className="text-[11px] text-gray-500">{item.farmer?.district}, {item.farmer?.state}</div>
                  </td>
                  <td>
                    <span className="font-bold text-emerald-700">{item.quantity_available} Quintals</span>
                  </td>
                  <td>
                    <div className="text-xs text-gray-600">
                      Res: <span className="font-medium">{item.quantity_reserved}</span> | Sold: <span className="font-medium">{item.quantity_sold}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-bold text-gray-900">₹{item.price_per_unit}</span>
                  </td>
                  <td>
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
                  </td>
                  <td>
                    <span className="text-xs text-gray-600">{item.harvest_date || "N/A"}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.status === "available"
                          ? "badge-emerald"
                          : item.status === "reserved"
                          ? "badge-amber"
                          : "badge-purple"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
