"use client";

import { useState, useEffect } from "react";
import { BarChart3, PieChart, TrendingUp, Calendar, MapPin } from "lucide-react";
import { CropDistributionChart, ProcurementTrendChart, DistrictComparisonChart } from "@/components/charts/AnalyticsCharts";
import { analyticsApi } from "@/lib/api";

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await analyticsApi.getCropAnalytics();
        setAnalyticsData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-emerald-600" /> AgriConnect Analytics & Intelligence
        </h1>
        <p className="text-sm text-gray-500">
          Visual reporting on crop distribution, monthly procurement fulfillment, and district supply trends.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 font-outfit">
              <PieChart className="w-5 h-5 text-emerald-600" /> Crop Produce Distribution (Quintals)
            </h2>
            <span className="badge badge-emerald">Live Stock</span>
          </div>
          <CropDistributionChart data={analyticsData?.crop_distribution} />
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 font-outfit">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Monthly Procurement Target vs Fulfillment
            </h2>
            <span className="badge badge-blue">Target 2026</span>
          </div>
          <ProcurementTrendChart />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 font-outfit">
            <MapPin className="w-5 h-5 text-amber-600" /> District Farmer Participation & Supply Capacity
          </h2>
          <span className="badge badge-amber font-mono">5 Major Districts</span>
        </div>
        <DistrictComparisonChart />
      </div>
    </div>
  );
}
