import Link from "next/link";
import { Sprout, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold font-outfit text-white">
                Agri<span className="text-emerald-400">Connect</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Smart Farmer Procurement and Sales Management System. Connecting Indian farmers directly to procurement centers and buyers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              For Farmers
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register/farmer" className="hover:text-emerald-400">
                  Register Farm
                </Link>
              </li>
              <li>
                <Link href="/farmer/inventory" className="hover:text-emerald-400">
                  List Produce Inventory
                </Link>
              </li>
              <li>
                <Link href="/farmer/procurement" className="hover:text-emerald-400">
                  Procurement Slot Allocation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              For Buyers
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register/buyer" className="hover:text-emerald-400">
                  Register as Buyer
                </Link>
              </li>
              <li>
                <Link href="/buyer/marketplace" className="hover:text-emerald-400">
                  Fresh Produce Marketplace
                </Link>
              </li>
              <li>
                <Link href="/buyer/map" className="hover:text-emerald-400">
                  Farmer Produce Map
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              System & Analytics
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-emerald-400">
                  Admin Portal Login
                </Link>
              </li>
              <li>
                <span className="text-gray-500">Smart Allocation Engine (Haversine + Grade)</span>
              </li>
              <li>
                <span className="text-gray-500">Leaflet OpenStreetMap Spatial GIS</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-xs text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AgriConnect System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Smart Farmer Procurement with <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
