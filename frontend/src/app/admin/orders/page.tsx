"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Search, Filter, CheckCircle2, Truck, Clock, XCircle } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersApi.getAll();
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await ordersApi.updateStatus(orderId, status);
      toast.success(`Order #${orderId} status updated to ${status}!`);
      loadOrders();
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter((o) => statusFilter === "all" || o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-purple-600" /> Buyer Direct Produce Orders
        </h1>
        <p className="text-sm text-gray-500">
          Monitor trade orders placed by registered wholesale buyers to farmers and manage logistics fulfillment.
        </p>
      </div>

      <div className="card p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-sm py-2 max-w-xs"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">In Transit / Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Items & Produce</th>
              <th>Total Price</th>
              <th>Delivery Address</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
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
                          • {item.inventory?.product?.name || `Item #${item.inventory_id}`}: {item.quantity} Qtl @ ₹{item.price_per_unit}
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
                          : o.status === "cancelled"
                          ? "badge-red"
                          : "badge-amber"
                      }`}
                    >
                      {o.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      className="input text-xs py-1 px-2 max-w-[130px]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
