"use client";

import Link from "next/link";
import { Sprout, Users, ShoppingCart, BarChart3, MapPin, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import GoogleTranslate from "@/components/common/GoogleTranslate";

export default function HomePage() {
  const { language, toggleLanguage, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-200">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 font-outfit">{t.brandName}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Global Language Switcher Button Bar */}
            <GoogleTranslate />

            <Link href="/login" className="btn btn-outline text-xs sm:text-sm px-3 sm:px-4 py-2">
              {t.signIn}
            </Link>
            <Link href="/register/farmer" className="btn btn-primary text-xs sm:text-sm px-4 py-2 shadow-emerald-200">
              {t.getStarted}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient text-white pt-28 pb-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span className="text-sm font-semibold">{t.heroBadge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight font-outfit">
            {t.heroTitle1}
            <br />
            <span className="text-yellow-300 drop-shadow-md">{t.heroTitle2}</span>
          </h1>
          <p className="text-base sm:text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register/farmer"
              className="btn btn-lg font-bold shadow-xl w-full sm:w-auto"
              style={{ background: "white", color: "#16a34a" }}
            >
              {t.startFreeToday} →
            </Link>
            <Link
              href="/login"
              className="btn btn-lg w-full sm:w-auto"
              style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.4)" }}
            >
              {t.viewDashboard}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: t.activeFarmers, value: "5,000+", icon: "🌾" },
              { label: t.procurementValue, value: "₹50Cr+", icon: "💰" },
              { label: t.collectionCenters, value: "200+", icon: "🏭" },
              { label: t.statesCovered, value: "12", icon: "🗺️" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-green-600 font-mono">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 font-outfit">{t.featuresTitle}</h2>
            <p className="text-gray-500 text-base sm:text-lg">{t.featuresSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sprout className="w-7 h-7 text-green-600" />,
                bg: "bg-green-50",
                title: t.f1Title,
                desc: t.f1Desc,
              },
              {
                icon: <ShoppingCart className="w-7 h-7 text-blue-600" />,
                bg: "bg-blue-50",
                title: t.f2Title,
                desc: t.f2Desc,
              },
              {
                icon: <MapPin className="w-7 h-7 text-red-600" />,
                bg: "bg-red-50",
                title: t.f3Title,
                desc: t.f3Desc,
              },
              {
                icon: <Zap className="w-7 h-7 text-yellow-600" />,
                bg: "bg-yellow-50",
                title: t.f4Title,
                desc: t.f4Desc,
              },
              {
                icon: <BarChart3 className="w-7 h-7 text-purple-600" />,
                bg: "bg-purple-50",
                title: t.f5Title,
                desc: t.f5Desc,
              },
              {
                icon: <Shield className="w-7 h-7 text-gray-600" />,
                bg: "bg-gray-50",
                title: t.f6Title,
                desc: t.f6Desc,
              },
            ].map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 font-outfit">{t.rolesTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: t.farmerRoleTitle,
                emoji: "🌾",
                color: "from-green-600 to-emerald-700",
                features: [t.farmerF1, t.farmerF2, t.farmerF3, t.farmerF4],
                cta: t.farmerCta,
                link: "/register/farmer",
              },
              {
                role: t.buyerRoleTitle,
                emoji: "🛒",
                color: "from-blue-600 to-indigo-700",
                features: [t.buyerF1, t.buyerF2, t.buyerF3, t.buyerF4],
                cta: t.buyerCta,
                link: "/register/buyer",
              },
              {
                role: t.adminRoleTitle,
                emoji: "🏛️",
                color: "from-purple-600 to-slate-800",
                features: [t.adminF1, t.adminF2, t.adminF3, t.adminF4],
                cta: t.adminCta,
                link: "/login",
              },
            ].map((r) => (
              <div key={r.role} className="card overflow-hidden flex flex-col justify-between shadow-md">
                <div>
                  <div className={`bg-gradient-to-br ${r.color} p-6 text-white`}>
                    <div className="text-4xl mb-3">{r.emoji}</div>
                    <h3 className="text-xl font-bold">{r.role}</h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      {r.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link href={r.link} className="btn btn-primary w-full text-center flex items-center justify-center">
                    {r.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl font-outfit">{t.brandName}</span>
          </div>
          <p className="text-sm text-gray-400">{t.footerText}</p>
        </div>
      </footer>
    </div>
  );
}
