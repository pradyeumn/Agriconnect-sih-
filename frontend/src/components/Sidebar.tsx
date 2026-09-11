"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Calendar,
  Layers,
  MapPin,
  BarChart3,
  Building2,
  ShoppingCart,
  Bell,
  TrendingUp,
  Sprout,
  Store
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "farmer" | "buyer";
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Farmers Directory", href: "/admin/farmers", icon: Users },
    { name: "Buyers Directory", href: "/admin/buyers", icon: Store },
    { name: "Inventory Monitor", href: "/admin/inventory", icon: Package },
    { name: "Procurement Requirements", href: "/admin/procurement", icon: Calendar },
    { name: "Procurement Slots", href: "/admin/slots", icon: Layers },
    { name: "Smart Allocations", href: "/admin/allocations", icon: TrendingUp },
    { name: "Collection Centers", href: "/admin/collection-centers", icon: Building2 },
    { name: "Orders Management", href: "/admin/orders", icon: ShoppingBag },
    { name: "Analytics & Reports", href: "/admin/analytics", icon: BarChart3 },
    { name: "Spatial Map View", href: "/admin/map", icon: MapPin },
  ];

  const farmerLinks = [
    { name: "Dashboard", href: "/farmer", icon: LayoutDashboard },
    { name: "My Produce Inventory", href: "/farmer/inventory", icon: Package },
    { name: "Direct Buyer Orders", href: "/farmer/orders", icon: ShoppingBag },
    { name: "Procurement Slots", href: "/farmer/procurement", icon: Calendar },
    { name: "Sales & Earnings", href: "/farmer/sales", icon: TrendingUp },
    { name: "Notifications", href: "/farmer/notifications", icon: Bell },
  ];

  const buyerLinks = [
    { name: "Dashboard", href: "/buyer", icon: LayoutDashboard },
    { name: "Fresh Produce Marketplace", href: "/buyer/marketplace", icon: Store },
    { name: "Nearby Farmers Map", href: "/buyer/map", icon: MapPin },
    { name: "My Cart", href: "/buyer/cart", icon: ShoppingCart },
    { name: "Order History", href: "/buyer/orders", icon: ShoppingBag },
    { name: "Notifications", href: "/buyer/notifications", icon: Bell },
  ];

  const links = role === "admin" ? adminLinks : role === "farmer" ? farmerLinks : buyerLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 z-30 w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] flex flex-col justify-between transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {role.toUpperCase()} PORTAL
          </div>
          <nav className="mt-2 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom role indicator box */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Mode</p>
              <p className="text-xs font-bold text-emerald-800 capitalize">{role} Workspace</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
