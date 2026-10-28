"use client";

import React from 'react';
import { BarChart3, Download, IndianRupee, Package, TrendingUp } from 'lucide-react';
import { DashboardSummary } from '../types';
import { formatINR } from '../lib/format';
import { InteractiveAnalyticsChart } from './InteractiveAnalyticsChart';

interface ReportsViewProps {
  summary: DashboardSummary | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ summary }) => {
  if (!summary) {
    return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
  }

  const handleDownloadProductsCsv = () => {
    window.open('/api/csv/export/products', '_blank');
  };

  const handleDownloadTransactionsCsv = () => {
    window.open('/api/csv/export/transactions', '_blank');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header with Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#795548]" />
            Inventory Valuation & Analytical Reports
          </h3>
          <p className="text-xs text-slate-500">
            Real-time aggregate calculations generated directly from Supabase PostgreSQL database records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadProductsCsv}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Products CSV</span>
          </button>
          <button
            onClick={handleDownloadTransactionsCsv}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Transactions CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Portfolio Valuation</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {formatINR(summary.totalInventoryValuation)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Live market asset value</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Units In Stock</span>
            <Package className="w-4 h-4 text-[#795548]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {summary.categorySummaries.reduce((acc, c) => acc + c.totalQuantity, 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across {summary.totalActiveProducts} active SKUs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Audit Entries</span>
            <TrendingUp className="w-4 h-4 text-[#795548]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {summary.totalTransactionsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Immutable ledger movements</div>
        </div>
      </div>

      {/* Interactive Time-Series Analytics Chart */}
      <InteractiveAnalyticsChart
        initialRange="6m"
        compact={false}
        title="Historical Stock Inflow, Dispatch & Portfolio Trajectory"
        subtitle="Multi-scale financial valuation analysis compiled from transactional audit logs"
      />

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-base">Category Valuation Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Active SKUs</th>
                <th className="py-3 px-4">Total Physical Units</th>
                <th className="py-3 px-4">Total Inventory Value (₹)</th>
                <th className="py-3 px-4 text-right">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.categorySummaries.map((c) => {
                const share = summary.totalInventoryValuation > 0
                  ? ((c.totalValuation / summary.totalInventoryValuation) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={c.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.category}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{c.productCount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{c.totalQuantity.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatINR(c.totalValuation)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#795548]">
                      {share}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
