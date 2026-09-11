"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem("agriconnect_user") || "{}");
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "farmer") router.push("/farmer");
      else router.push("/buyer");
      toast.success("Welcome back!");
    } catch (err: unknown) {
      toast.error(formatErrorMessage(err, "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-center p-12 text-white">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">AgriConnect</span>
        </div>
        <h2 className="text-4xl font-bold mb-6 leading-tight">
          Smart Procurement for Modern Agriculture
        </h2>
        <p className="text-green-100 text-lg mb-10">
          Connecting farmers, buyers, and administrators in one seamless platform.
        </p>
        <div className="space-y-4">
          {[
            { label: "Farmers registered", value: "5,000+" },
            { label: "Transactions completed", value: "₹50Cr+" },
            { label: "Collection centers", value: "200+" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <div className="w-2 h-2 bg-yellow-300 rounded-full" />
              <span className="text-green-100">{s.label}: <strong className="text-white">{s.value}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">AgriConnect</span>
          </div>

          <div className="card p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500 mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don&#39;t have an account?{" "}
                <Link href="/register" className="text-green-600 font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-green-50 rounded-xl">
              <p className="text-xs font-bold text-green-800 mb-2">Demo Credentials</p>
              <div className="space-y-1 text-xs text-green-700">
                <p>Admin: <strong>admin@agriconnect.in</strong> / admin123</p>
                <p>Farmer: <strong>farmer1@agriconnect.in</strong> / farmer123</p>
                <p>Buyer: <strong>buyer1@agriconnect.in</strong> / buyer123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
