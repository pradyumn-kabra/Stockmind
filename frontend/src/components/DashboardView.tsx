"use client";

import React from 'react';
import {
  IndianRupee,
  Package,
  AlertTriangle,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DashboardSummary } from '../types';
import { formatINR, formatINRCompact } from '../lib/format';
import { InteractiveAnalyticsChart } from './InteractiveAnalyticsChart';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  onNavigate: (tab: string, filter?: string) => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  onNavigate,
  onSeedDemo,
  isSeeding,
}) => {
  if (!summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#795548] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Calculating real-time inventory metrics...</p>
        </div>
      </div>
    );
  }

  const isBrandNew = summary.totalActiveProducts === 0;

  return (
    <div className="px-5 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5 space-y-5 sm:space-y-6 lg:space-y-7 max-w-7xl mx-auto">
      {/* Zero State / Quick Demo Banner */}
      {isBrandNew && (
        <div className="bg-gradient-to-r from-[#4E342E] to-slate-900 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between border border-[#5D4037]/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#A88970]" />
              <h3 className="font-bold text-lg">Welcome to StockMind 2.0</h3>
            </div>
            <p className="text-sm text-[#E3C8B5]">
              Database is currently clean. You can populate 35+ realistic catalog items, suppliers, and transaction histories with one click.
            </p>
          </div>
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="px-5 py-2.5 bg-[#8D6E63] hover:bg-[#795548] font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isSeeding ? 'Seeding Catalog...' : 'Load Demo Dataset'}
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Valuation */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700 transition-colors">Inventory Valuation</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-200">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-800 transition-colors">
              {formatINR(summary.totalInventoryValuation)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Calculated via price × current quantity</p>
          </div>
        </div>

        {/* Active Products - Interactive with hover animation */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#A88970] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-[#795548] transition-colors">Active SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-[#F3EEE7] text-[#795548] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#EDE4D9] transition-all duration-200">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#5D4037] transition-colors">{summary.totalActiveProducts}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Active inventory items tracked</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate('products', 'LOW_STOCK')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-amber-700 transition-colors">Low Stock SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-600 group-hover:text-amber-700 transition-colors">{summary.lowStockCount}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Items at or below reorder threshold</p>
          </div>
        </div>

        {/* Anomaly Alerts */}
        <div
          onClick={() => onNavigate('alerts')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-rose-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-rose-700 transition-colors">Open Anomalies</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-200">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-rose-600 group-hover:text-rose-700 transition-colors">{summary.openAlertsCount}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Suspicious movements requiring review</p>
          </div>
        </div>
      </div>

      {/* Interactive Time-Series Analytics Chart */}
      <InteractiveAnalyticsChart
        initialRange="6m"
        compact={false}
        title="Live Inventory Valuation & Movement Trajectory"
        subtitle=""
      />

      {/* Main Grid: Low Stock Warnings & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 sm:pt-6">
        {/* Low Stock Replenishment Recommendations (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Replenishment Priority</h3>
              <p className="text-xs text-slate-500">Products requiring immediate supplier reorders</p>
            </div>
            <button
              onClick={() => onNavigate('products', 'LOW_STOCK')}
              className="text-xs font-semibold text-[#795548] hover:text-[#4E342E] flex items-center gap-1"
            >
              View All ({summary.lowStockCount}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary.lowStockProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              All inventory levels are currently above configured reorder thresholds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-100 pb-2">
                    <th className="pb-3 font-semibold">SKU / Item</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Current Stock</th>
                    <th className="pb-3 font-semibold">Reorder Lvl</th>
                    <th className="pb-3 font-semibold text-right">Suggested Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.lowStockProducts.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-medium text-slate-900">
                        <div>{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.id}</div>
                      </td>
                      <td className="py-3 text-slate-600">{item.category}</td>
                      <td className="py-3">
                        <span className="font-bold text-rose-600 font-mono">
                          {item.quantity} {item.unit || 'units'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">
                        {item.reorderLevel} {item.unit || 'units'}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#F3EEE7] text-[#5D4037] font-mono">
                          +{item.suggestedReorderQuantity} {item.unit || 'units'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Breakdown & Valuation Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Valuation by Category</h3>
          <p className="text-xs text-slate-500">Asset concentration across product lines</p>

          <div className="space-y-4 pt-2">
            {summary.categorySummaries.map((cat) => {
              const percent = summary.totalInventoryValuation > 0
                ? Math.round((cat.totalValuation / summary.totalInventoryValuation) * 100)
                : 0;
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.category} ({cat.productCount})</span>
                    <span className="font-mono text-slate-600 font-medium">
                      {formatINRCompact(cat.totalValuation)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#795548] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
