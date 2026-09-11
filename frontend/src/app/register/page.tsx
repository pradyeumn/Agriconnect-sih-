"use client";

import Link from "next/link";
import { Sprout, Users, ShoppingCart } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Outfit" }}>AgriConnect</span>
      </div>

      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Join AgriConnect</h1>
          <p className="text-gray-500">Choose how you want to use the platform</p>
        </div>

        <div className="grid gap-4">
          <Link href="/register/farmer" id="register-as-farmer" className="card card-hover p-6 flex items-center gap-5 cursor-pointer" style={{ textDecoration: "none" }}>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sprout className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">I&apos;m a Farmer</h3>
              <p className="text-gray-500 text-sm mt-1">
                Register your farm, list crops for sale, and participate in procurement programs.
              </p>
            </div>
            <div className="ml-auto text-gray-300 text-2xl">→</div>
          </Link>

          <Link href="/register/buyer" id="register-as-buyer" className="card card-hover p-6 flex items-center gap-5 cursor-pointer" style={{ textDecoration: "none" }}>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">I&apos;m a Buyer</h3>
              <p className="text-gray-500 text-sm mt-1">
                Browse local farm produce, place orders directly from farmers, track deliveries.
              </p>
            </div>
            <div className="ml-auto text-gray-300 text-2xl">→</div>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
