"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, MapPin, CreditCard, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi, formatErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

export default function BuyerCheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { buyer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(
    buyer?.address || "APMC Market Yard, Market Yard Rd, Gultekadi, Pune, Maharashtra 411037"
  );
  const [paymentMethod, setPaymentMethod] = useState("direct_transfer");

  if (items.length === 0) {
    router.push("/buyer/cart");
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        price_per_unit: item.inventory.price_per_unit,
      }));

      await ordersApi.create({
        items: orderItems,
        delivery_address: address,
        latitude: buyer?.latitude || 18.49,
        longitude: buyer?.longitude || 73.86,
      });

      toast.success("Order placed successfully! Farmers notified.");
      clearCart();
      router.push("/buyer/orders");
    } catch (err: any) {
      toast.error(formatErrorMessage(err, "Failed to place order. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-blue-600" /> Sourcing Order Checkout
        </h1>
        <p className="text-sm text-gray-500">Confirm delivery address and payment terms.</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        {/* Delivery Address */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 font-outfit flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Delivery Address
          </h2>
          <div>
            <textarea
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input text-sm"
              placeholder="Full warehouse or retail delivery address..."
            />
          </div>
        </div>

        {/* Payment Simulation */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 font-outfit flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" /> Payment Guarantee Mode
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition ${
                paymentMethod === "direct_transfer"
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="direct_transfer"
                checked={paymentMethod === "direct_transfer"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-blue-600"
              />
              <div>
                <p className="font-bold text-xs text-gray-900">Escrow Direct Bank Transfer</p>
                <p className="text-[11px] text-gray-500">Released upon delivery inspection</p>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition ${
                paymentMethod === "mandi_credit"
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="mandi_credit"
                checked={paymentMethod === "mandi_credit"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-blue-600"
              />
              <div>
                <p className="font-bold text-xs text-gray-900">APMC Mandi Credit Terms</p>
                <p className="text-[11px] text-gray-500">7-day verified credit line</p>
              </div>
            </label>
          </div>
        </div>

        {/* Total Summary */}
        <div className="card p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-blue-200 uppercase font-semibold">Total Order Payment</p>
            <h3 className="text-3xl font-extrabold font-outfit">₹{totalAmount.toLocaleString("en-IN")}</h3>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 py-3 text-base flex items-center gap-2 shadow-xl w-full sm:w-auto justify-center"
          >
            {loading ? "Confirming Order..." : "Place Sourcing Order"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
