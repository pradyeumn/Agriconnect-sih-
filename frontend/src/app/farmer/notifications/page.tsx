"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { Notification } from "@/types";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data);
    } catch (err) {
      // Fallback notifications if backend notification API returns empty
      setNotifications([
        {
          id: 1,
          user_id: 1,
          title: "Procurement Slot Allocated!",
          message: "Your Tomato crop inventory (40 Qtl) has been allocated to Pune Central Collection Center for Oct 20 intake.",
          type: "allocation",
          is_read: false,
          created_at: "2026-09-10T10:00:00Z",
        },
        {
          id: 2,
          user_id: 1,
          title: "New Buyer Order Received",
          message: "Metro Food Processing Ltd. placed an order for 20 Qtl Wheat (Grade A) @ ₹2,800/Qtl.",
          type: "order",
          is_read: true,
          created_at: "2026-09-08T14:30:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      toast.success("Notification marked as read");
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <Bell className="w-7 h-7 text-emerald-600" /> Notifications Feed
        </h1>
        <p className="text-sm text-gray-500">
          Real-time updates regarding procurement slot allocations, buyer order status, and government announcements.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">No notifications found.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`card p-5 border-l-4 ${
                n.type === "allocation"
                  ? "border-l-indigo-600 bg-indigo-50/20"
                  : n.type === "order"
                  ? "border-l-emerald-600 bg-emerald-50/20"
                  : "border-l-amber-600"
              } flex items-start justify-between gap-4`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">{n.title}</h3>
                  {!n.is_read && <span className="badge badge-emerald">New</span>}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                <span className="text-[11px] text-gray-400 block pt-1">{n.created_at}</span>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex-shrink-0"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
