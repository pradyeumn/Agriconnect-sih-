"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b"];

export function CropDistributionChart({ data }: { data: { name: string; quantity: number }[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading chart...</div>;

  const chartData = data && data.length > 0 ? data : [
    { name: "Tomato", quantity: 450 },
    { name: "Wheat", quantity: 1200 },
    { name: "Rice", quantity: 980 },
    { name: "Potato", quantity: 650 },
    { name: "Onion", quantity: 500 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={4}
            dataKey="quantity"
            nameKey="name"
            label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [`${value} quintals`, "Quantity"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProcurementTrendChart({ data }: { data?: any[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading chart...</div>;

  const chartData = data && data.length > 0 ? data : [
    { month: "Jan", required: 500, allocated: 420 },
    { month: "Feb", required: 700, allocated: 650 },
    { month: "Mar", required: 1200, allocated: 1100 },
    { month: "Apr", required: 900, allocated: 880 },
    { month: "May", required: 1500, allocated: 1420 },
    { month: "Jun", required: 1800, allocated: 1750 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="required" name="Target Quantity (Qtl)" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="allocated" name="Allocated Quantity (Qtl)" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DistrictComparisonChart({ data }: { data?: any[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading chart...</div>;

  const chartData = data && data.length > 0 ? data : [
    { district: "Nashik", farmers: 45, supply: 1200 },
    { district: "Pune", farmers: 38, supply: 950 },
    { district: "Nagpur", farmers: 29, supply: 810 },
    { district: "Ludhiana", farmers: 52, supply: 1600 },
    { district: "Karnal", farmers: 41, supply: 1100 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="district" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Legend />
          <Bar dataKey="farmers" name="Registered Farmers" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="supply" name="Total Produce (Qtl)" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
