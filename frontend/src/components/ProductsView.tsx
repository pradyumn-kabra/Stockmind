"use client";

import React, { useState } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  History,
  Edit2,
  Trash2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { Product, StockTransaction } from '../types';
import { api } from '../lib/api';
import { formatINR } from '../lib/format';

interface ProductsViewProps {
  products: Product[];
  initialStatusFilter?: string;
  onOpenCreate: () => void;
  onEditProduct: (p: Product) => void;
  onDeactivateProduct: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  initialStatusFilter = 'ALL',
  onOpenCreate,
  onEditProduct,
  onDeactivateProduct,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);

  React.useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Transaction history drawer state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productHistory, setProductHistory] = useState<StockTransaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Extract unique categories
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();

  // Filtered Products
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesType = typeFilter === 'ALL' || p.productType === typeFilter;

    let matchesStatus = true;
    if (statusFilter === 'LOW_STOCK') {
      matchesStatus = p.replenishmentNeeded;
    } else if (statusFilter === 'ACTIVE') {
      matchesStatus = p.active;
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = !p.active;
    }

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const handleOpenHistory = async (prod: Product) => {
    setSelectedProduct(prod);
    setIsLoadingHistory(true);
    try {
      const history = await api.getProductTransactions(prod.id);
      setProductHistory(history);
    } catch (e) {
      setProductHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#795548] bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#795548]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#795548]"
          >
            <option value="ALL">All Product Types</option>
            <option value="STANDARD">STANDARD</option>
            <option value="PERISHABLE">PERISHABLE</option>
            <option value="ELECTRONIC">ELECTRONIC</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#795548]"
          >
            <option value="ALL">All Status</option>
            <option value="LOW_STOCK">Low Stock Only</option>
            <option value="ACTIVE">Active SKUs</option>
            <option value="INACTIVE">Deactivated</option>
          </select>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#795548] hover:bg-[#4E342E] rounded-xl transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">SKU / Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Price (₹)</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Reorder Min</th>
                <th className="py-3.5 px-4">Type Details</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No products matched your search/filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.replenishmentNeeded;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="font-mono text-xs text-slate-400">{p.id}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{p.category}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.productType === 'PERISHABLE' ? 'bg-amber-100 text-amber-800' :
                          p.productType === 'ELECTRONIC' ? 'bg-[#EDE4D9] text-[#4E342E]' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {p.productType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {formatINR(p.price)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                            {p.quantity} {p.unit || 'units'}
                          </span>
                          {isLow && (
                            <span title="Replenishment Needed">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {p.reorderLevel} {p.unit || 'units'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {p.productType === 'PERISHABLE' && p.expiryDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span className={p.expired ? 'text-rose-600 font-bold' : ''}>
                              Exp: {p.expiryDate} {p.expired ? '(Expired)' : `(${p.daysUntilExpiry}d left)`}
                            </span>
                          </div>
                        )}
                        {p.productType === 'ELECTRONIC' && (
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#795548]" />
                            <span>{p.warrantyMonths}m Warranty</span>
                          </div>
                        )}
                        {p.productType === 'STANDARD' && <span className="text-slate-400">Standard Shelf</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenHistory(p)}
                            title="View Transaction History"
                            className="p-1.5 text-slate-400 hover:text-[#795548] hover:bg-[#F3EEE7] rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditProduct(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {p.active && (
                            <button
                              onClick={() => {
                                if (confirm(`Deactivate product "${p.name}"? Historical transactions will be preserved.`)) {
                                  onDeactivateProduct(p.id);
                                }
                              }}
                              title="Deactivate SKU (Soft Delete)"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Transaction History Drawer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedProduct.name}</h3>
                <p className="text-xs font-mono text-slate-400">{selectedProduct.id} • Stock: {selectedProduct.quantity}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Movement History</h4>
              {isLoadingHistory ? (
                <div className="py-8 text-center text-sm text-slate-400">Loading ledger...</div>
              ) : productHistory.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No transactions recorded for this SKU.</div>
              ) : (
                productHistory.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{tx.transactionType}</span>
                      <span className="font-mono text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm font-semibold flex items-center justify-between">
                      <span className={tx.transactionType === 'STOCK_IN' ? 'text-emerald-600' : 'text-slate-700'}>
                        Delta: {tx.transactionType === 'STOCK_IN' ? `+${tx.quantity}` : `${tx.quantity}`}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {tx.previousQuantity} → {tx.resultingQuantity}
                      </span>
                    </div>
                    {tx.reason && <p className="text-xs text-slate-500 italic">"{tx.reason}"</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
