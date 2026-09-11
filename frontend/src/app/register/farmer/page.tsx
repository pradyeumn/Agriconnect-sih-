"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout, MapPin, ArrowRight, CheckCircle, User, Phone, Mail, Lock, ShieldCheck } from "lucide-react";
import LeafletMap from "@/components/maps/LeafletMap";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function RegisterFarmerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    village: "Khed",
    district: "Pune",
    state: "Maharashtra",
    pincode: "410505",
    farm_size: 5.5,
    crops: "Tomato, Wheat, Onion",
    latitude: 18.85,
    longitude: 73.88,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "farm_size" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectLocation = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
    }));
    toast.success(`Selected location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.registerFarmer({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        farm_size: Number(formData.farm_size),
        crops: formData.crops,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });

      toast.success("Farmer registration successful! Please log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 px-8 py-8 text-white relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-outfit tracking-wide">AgriConnect Farmer Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit">Join India's Smart Procurement Network</h1>
          <p className="mt-2 text-emerald-100 text-sm max-w-xl">
            Register your farm to get automated slot allocations at nearest collection centers and sell produce directly to buyers at guaranteed prices.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Account Credentials */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <User className="w-5 h-5 text-emerald-600" /> Account & Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
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
                  placeholder="farmer@agriconnect.org"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Account Password</label>
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

          {/* Farm Details */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Sprout className="w-5 h-5 text-emerald-600" /> Farm Land & Crop Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Farm Land Size (in Acres)</label>
                <input
                  type="number"
                  name="farm_size"
                  step="0.1"
                  required
                  placeholder="e.g. 5.5"
                  value={formData.farm_size}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Main Cultivated Crops</label>
                <input
                  type="text"
                  name="crops"
                  required
                  placeholder="e.g. Tomato, Wheat, Potato, Onion"
                  value={formData.crops}
                  onChange={handleChange}
                  className="input"
                />
                <span className="text-[11px] text-gray-500">Separate multiple crops with commas</span>
              </div>
            </div>
          </div>

          {/* Location & GPS Map Picker */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 border-b pb-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Farm Location & Map Pin Point
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Click anywhere on the interactive map below to select your exact farm GPS coordinates. This will be used by our Smart Allocation Engine to calculate distance to procurement centers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Village / Taluka</label>
                <input
                  type="text"
                  name="village"
                  required
                  value={formData.village}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            {/* GPS display */}
            <div className="flex flex-wrap gap-4 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
              <div>
                <span className="font-semibold text-emerald-900">Selected Latitude:</span>{" "}
                <span className="font-mono text-emerald-700 font-bold">{formData.latitude}</span>
              </div>
              <div>
                <span className="font-semibold text-emerald-900">Selected Longitude:</span>{" "}
                <span className="font-mono text-emerald-700 font-bold">{formData.longitude}</span>
              </div>
            </div>

            {/* Map Picker Component */}
            <LeafletMap
              center={[formData.latitude, formData.longitude]}
              zoom={10}
              selectable={true}
              selectedLocation={[formData.latitude, formData.longitude]}
              onSelectLocation={handleSelectLocation}
              className="h-[320px] w-full rounded-2xl border border-gray-200 shadow-inner"
            />
          </div>

          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Already registered? Sign in here →
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full sm:w-auto px-8 py-3 text-base flex items-center justify-center gap-2"
            >
              {loading ? "Registering Farm..." : "Complete Farmer Registration"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
