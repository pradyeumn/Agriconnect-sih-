"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, CheckCircle, Clock } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import toast from "react-hot-toast";

export default function FarmerOrdersPage() {
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
      toast.error("Failed to load buyer orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-purple-600" /> Direct Buyer Orders
        </h1>
        <p className="text-sm text-gray-500">
          Purchase orders received directly from verified marketplace buyers.
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer Info</th>
              <th>Produce Purchased</th>
              <th>Total Amount</th>
              <th>Delivery Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No buyer orders received yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="font-mono font-bold text-gray-900">#{o.id}</span>
                  </td>
                  <td>
                    <div className="font-bold text-gray-800">{o.buyer?.name || `Buyer #${o.buyer_id}`}</div>
                    <div className="text-[11px] text-gray-500">{o.buyer?.phone}</div>
                  </td>
                  <td>
                    <div className="text-xs space-y-1">
                      {o.items?.map((item, idx) => (
                        <div key={idx} className="text-gray-800 font-medium">
                          • {item.inventory?.product?.name || `Item #${item.inventory_id}`}: {item.quantity} Qtl
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="font-extrabold text-purple-700">₹{o.total_amount?.toLocaleString("en-IN")}</span>
                  </td>
                  <td>
                    <div className="text-xs text-gray-600 max-w-xs truncate">{o.delivery_address}</div>
                  </td>
                  <td>
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
