"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Truck, CheckCircle2, Clock } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import toast from "react-hot-toast";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersApi.getAll();
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-blue-600" /> Sourcing Order History
        </h1>
        <p className="text-sm text-gray-500">Track status and delivery of produce orders placed to farmers.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No orders placed yet.</div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">Order #{o.id}</span>
                  <span
                    className={`badge ${
                      o.status === "delivered"
                        ? "badge-emerald"
                        : o.status === "shipped"
                        ? "badge-blue"
                        : o.status === "confirmed"
                        ? "badge-indigo"
                        : "badge-amber"
                    }`}
                  >
                    {o.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  {o.items?.map((item, idx) => (
                    <div key={idx} className="text-gray-800 font-medium">
                      • {item.inventory?.product?.name || `Product #${item.inventory_id}`}: {item.quantity} Qtl @ ₹{item.price_per_unit}/Qtl
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500">Delivery: {o.delivery_address}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-blue-700 font-outfit">
                  ₹{o.total_amount?.toLocaleString("en-IN")}
                </div>
                <span className="text-xs text-gray-400 block mt-0.5">{o.created_at || "Recent Order"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
