"use client";

import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function BuyerCartPage() {
  const { items, updateQuantity, removeFromCart, totalAmount, totalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center max-w-md mx-auto my-12 space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-outfit text-gray-900">Your Produce Order Cart is Empty</h2>
        <p className="text-xs text-gray-500">
          Explore the fresh produce marketplace to add crops from certified local farmers.
        </p>
        <Link href="/buyer/marketplace" className="btn btn-secondary inline-flex items-center gap-2 mt-2">
          Browse Produce Marketplace →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-blue-600" /> Sourcing Cart Review
          </h1>
          <p className="text-sm text-gray-500">Review selected crop quantities and direct farm pricing.</p>
        </div>

        <button onClick={clearCart} className="text-xs text-red-600 hover:text-red-800 font-semibold">
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((cartItem) => (
            <div
              key={cartItem.inventory_id}
              className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              <div className="space-y-1 w-full sm:w-auto">
                <span className="badge badge-blue">{cartItem.inventory.product?.category}</span>
                <h3 className="text-lg font-bold text-gray-900">{cartItem.inventory.product?.name}</h3>
                <p className="text-xs text-gray-600">
                  Farmer: <span className="font-semibold">{cartItem.inventory.farmer?.name}</span> ({cartItem.inventory.farmer?.district})
                </p>
                <div className="text-xs text-blue-700 font-bold">
                  ₹{cartItem.inventory.price_per_unit} per Quintal
                </div>
              </div>

              {/* Quantity adjustment & Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0">
                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(cartItem.inventory_id, cartItem.quantity - 1)}
                    className="p-1 rounded-lg bg-white hover:bg-gray-200 text-gray-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-bold text-sm font-mono text-gray-900">
                    {cartItem.quantity} Qtl
                  </span>
                  <button
                    onClick={() => updateQuantity(cartItem.inventory_id, cartItem.quantity + 1)}
                    className="p-1 rounded-lg bg-white hover:bg-gray-200 text-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold text-gray-900">
                    ₹{(cartItem.quantity * cartItem.inventory.price_per_unit).toLocaleString("en-IN")}
                  </div>
                  <button
                    onClick={() => removeFromCart(cartItem.inventory_id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="card p-6 h-fit space-y-6 bg-gradient-to-b from-white to-blue-50/30">
          <h2 className="text-xl font-bold font-outfit text-gray-900 border-b pb-3">Order Summary</h2>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total Produce Lines:</span>
              <span className="font-semibold text-gray-800">{items.length} items</span>
            </div>
            <div className="flex justify-between">
              <span>Total Sourced Volume:</span>
              <span className="font-semibold text-gray-800">{totalItems} Quintals</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-800">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Mandi / Logistics Fee:</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <div className="pt-3 border-t flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Payable Amount:</span>
              <span className="text-2xl font-extrabold text-blue-700 font-outfit">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Link
            href="/buyer/checkout"
            className="btn btn-secondary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            Proceed to Checkout <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
