"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, MapPin, ArrowRight, User, Phone, Mail, Lock, Building } from "lucide-react";
import LeafletMap from "@/components/maps/LeafletMap";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function RegisterBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "APMC Market Yard, Market Yard Rd, Gultekadi, Pune",
    latitude: 18.49,
    longitude: 73.86,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectLocation = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
    }));
    toast.success(`Location set to: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.registerBuyer({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });

      toast.success("Buyer registration successful! Please log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 px-8 py-8 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-outfit tracking-wide">AgriConnect Buyer Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit">Direct Farm Produce Sourcing</h1>
          <p className="mt-2 text-blue-100 text-sm max-w-xl">
            Source fresh, graded crops directly from certified local farmers with full transparent pricing and delivery tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <User className="w-5 h-5 text-blue-600" /> Organization & Contact Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Business / Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Metro Food Processing Ltd."
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9812345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="buyer@foodcorp.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 border-b pb-2">
              <Building className="w-5 h-5 text-blue-600" /> Delivery Address & Location
            </h2>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Delivery Address</label>
              <textarea
                name="address"
                rows={2}
                required
                value={formData.address}
                onChange={handleChange}
                className="input"
              />
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Click on the map to pin-point your delivery location coordinates for farm distance calculation:
            </p>

            <LeafletMap
              center={[formData.latitude, formData.longitude]}
              zoom={10}
              selectable={true}
              selectedLocation={[formData.latitude, formData.longitude]}
              onSelectLocation={handleSelectLocation}
              className="h-[300px] w-full rounded-2xl border border-gray-200 shadow-inner"
            />
          </div>

          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Already registered? Sign in here →
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-secondary w-full sm:w-auto px-8 py-3 text-base flex items-center justify-center gap-2"
            >
              {loading ? "Registering Buyer..." : "Complete Buyer Registration"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
