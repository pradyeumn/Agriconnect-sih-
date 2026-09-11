"use client";

import { TrendingUp, DollarSign, Calendar, CheckCircle } from "lucide-react";

export default function FarmerSalesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-emerald-600" /> Sales & Earnings History
        </h1>
        <p className="text-sm text-gray-500">
          Financial ledger of crop payments received from government procurement and direct buyer orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card border-l-4 border-l-emerald-500">
          <p className="stat-label">Total Revenue Earned</p>
          <h3 className="stat-value">₹1,45,000</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-2">↑ 24% vs last season</p>
        </div>

        <div className="stat-card border-l-4 border-l-blue-500">
          <p className="stat-label">Procurement Payouts</p>
          <h3 className="stat-value">₹98,000</h3>
          <p className="text-xs text-gray-500 mt-2">Government MSP Intake</p>
        </div>

        <div className="stat-card border-l-4 border-l-purple-500">
          <p className="stat-label">Direct Marketplace Sales</p>
          <h3 className="stat-value">₹47,000</h3>
          <p className="text-xs text-gray-500 mt-2">Direct Buyer Payments</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold font-outfit text-gray-900 mb-4">Recent Payment Transactions</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction Ref</th>
                <th>Channel / Source</th>
                <th>Crop Batch</th>
                <th>Quantity</th>
                <th>Amount Paid</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono text-xs font-semibold">TXN-884219</td>
                <td><span className="badge badge-emerald">Procurement Center</span></td>
                <td>Tomato (Grade A)</td>
                <td>35 Quintals</td>
                <td className="font-bold text-gray-900">₹98,000</td>
                <td className="text-xs text-gray-600">2026-09-02</td>
                <td><span className="badge badge-emerald">PAID</span></td>
              </tr>
              <tr>
                <td className="font-mono text-xs font-semibold">TXN-773104</td>
                <td><span className="badge badge-purple">Direct Buyer Order</span></td>
                <td>Wheat (Grade B)</td>
                <td>15 Quintals</td>
                <td className="font-bold text-gray-900">₹47,000</td>
                <td className="text-xs text-gray-600">2026-08-28</td>
                <td><span className="badge badge-emerald">PAID</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
