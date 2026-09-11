"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sprout, LogOut, User as UserIcon, ShoppingCart, Bell, Menu, X, Shield, Tractor, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import GoogleTranslate from "@/components/common/GoogleTranslate";
import { useState } from "react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, farmer, buyer, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case "admin":
        return (
          <span className="badge badge-admin flex items-center gap-1">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case "farmer":
        return (
          <span className="badge badge-farmer flex items-center gap-1">
            <Tractor className="w-3 h-3" /> Farmer
          </span>
        );
      case "buyer":
        return (
          <span className="badge badge-buyer flex items-center gap-1">
            <Store className="w-3 h-3" /> Buyer
          </span>
        );
      default:
        return null;
    }
  };

  const getDisplayName = () => {
    if (farmer) return farmer.name;
    if (buyer) return buyer.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold font-outfit text-gray-900 tracking-tight">
                Agri<span className="text-emerald-600">Connect</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                Procurement & Sales
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <GoogleTranslate />
          {user ? (
            <>
              {/* Role specific quick link */}
              {user.role === "buyer" && (
                <Link
                  href="/buyer/cart"
                  className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications Link */}
              <Link
                href={`/${user.role}/notifications`}
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </Link>

              {/* Role Badge */}
              <div className="hidden md:block">{getRoleBadge()}</div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg border border-gray-200 hover:border-emerald-500 transition bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium text-gray-800">
                    {getDisplayName()}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                      <div className="mt-1 md:hidden">{getRoleBadge()}</div>
                    </div>

                    <Link
                      href={`/${user.role}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 px-3 py-2"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary text-xs sm:text-sm py-2 px-4"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
