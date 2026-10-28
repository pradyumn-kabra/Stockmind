"use client";

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Product, StockTransaction, TransactionRequest, TransactionType } from '../types';
import { api } from '../lib/api';

interface TransactionsViewProps {
  products: Product[];
  transactions: StockTransaction[];
  onTransactionComplete: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  products,
  transactions,
  onTransactionComplete,
}) => {
  const activeProducts = products.filter((p) => p.active);
  const [selectedProductId, setSelectedProductId] = useState(activeProducts.length > 0 ? activeProducts[0].id : '');
  const [transactionType, setTransactionType] = useState<TransactionType>('STOCK_IN');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<StockTransaction | null>(null);

  // Synchronize selectedProductId dynamically when products list arrives
  React.useEffect(() => {
    if (activeProducts.length > 0) {
      if (!selectedProductId || !activeProducts.some((p) => p.id === selectedProductId)) {
        setSelectedProductId(activeProducts[0].id);
      }
    } else {
      setSelectedProductId('');
    }
  }, [activeProducts, selectedProductId]);

  const currentProduct = activeProducts.find((p) => p.id === selectedProductId) || activeProducts[0];

  // Dynamic Projected Balance Calculation
  const qtyNum = parseInt(quantity, 10) || 0;
  const currentStock = currentProduct ? currentProduct.quantity : 0;
  let delta = 0;

  if (transactionType === 'STOCK_IN') {
    delta = Math.abs(qtyNum);
  } else if (transactionType === 'STOCK_OUT' || transactionType === 'DAMAGE') {
    delta = -Math.abs(qtyNum);
  } else if (transactionType === 'ADJUSTMENT') {
    delta = qtyNum; // signed delta
  }

  const projectedStock = currentStock + delta;
  const willCauseNegative = projectedStock < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLastResult(null);

    if (!selectedProductId) {
      setError('Please select an active product.');
      return;
    }

    if (transactionType !== 'ADJUSTMENT' && qtyNum <= 0) {
      setError('Transaction quantity must be greater than zero.');
      return;
    }

    if (transactionType === 'ADJUSTMENT' && qtyNum === 0) {
      setError('Adjustment quantity cannot be zero.');
      return;
    }

    if ((transactionType === 'DAMAGE' || transactionType === 'ADJUSTMENT') && !reason.trim()) {
      setError(`A specific reason is mandatory for ${transactionType} operations.`);
      return;
    }

    const payload: TransactionRequest = {
      productId: selectedProductId,
      transactionType,
      quantity: transactionType === 'ADJUSTMENT' ? qtyNum : Math.abs(qtyNum),
      reason: reason.trim() || undefined,
    };

    try {
      setIsSubmitting(true);
      const res = await api.submitTransaction(payload);
      setLastResult(res);
      setReason('');
      onTransactionComplete();
    } catch (err: any) {
      setError(err.message || 'Transaction processing failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Transaction Terminal & Stock Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Terminal Input Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-[#795548]" />
              Inventory Movement Terminal
            </h3>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 shrink-0 text-rose-500" />
              <div>
                <p className="font-bold">Transaction Rejected</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {lastResult && (
            <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
              lastResult.flaggedAsAnomaly
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              {lastResult.flaggedAsAnomaly ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {lastResult.flaggedAsAnomaly
                    ? 'Transaction Recorded & Flagged for Review'
                    : 'Transaction Successfully Committed'}
                </p>
                <p className="text-xs">
                  Transaction <span className="font-mono font-bold">{lastResult.id}</span>: Updated stock from{' '}
                  <span className="font-mono font-bold">{lastResult.previousQuantity}</span> to{' '}
                  <span className="font-mono font-bold">{lastResult.resultingQuantity}</span>.
                </p>
                {lastResult.flaggedAsAnomaly && (
                  <p className="text-xs font-semibold text-amber-800 pt-1">
                    Anomaly Reason: {lastResult.anomalyExplanation}
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Product SKU *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#795548] bg-white"
                required
              >
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) — Current Stock: {p.quantity} {p.unit || 'units'}
                  </option>
                ))}
              </select>
            </div>

            {/* Movement Type Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Movement Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTransactionType('STOCK_IN')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    transactionType === 'STOCK_IN'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-xs">STOCK IN</span>
                  <span className="text-[10px] text-slate-400 font-normal">Receipts/Purchase</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransactionType('STOCK_OUT')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    transactionType === 'STOCK_OUT'
                      ? 'border-[#795548] bg-[#F3EEE7] text-[#4E342E] font-bold ring-1 ring-[#795548]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 text-[#795548] mb-1" />
                  <span className="text-xs">STOCK OUT</span>
                  <span className="text-[10px] text-slate-400 font-normal">Sales/Dispatch</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransactionType('DAMAGE')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    transactionType === 'DAMAGE'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-1 ring-rose-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 text-rose-600 mb-1" />
                  <span className="text-xs">DAMAGE</span>
                  <span className="text-[10px] text-slate-400 font-normal">Loss/Breakage</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransactionType('ADJUSTMENT')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    transactionType === 'ADJUSTMENT'
                      ? 'border-[#795548] bg-[#F3EEE7] text-[#4E342E] font-bold ring-1 ring-[#795548]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-[#795548] mb-1" />
                  <span className="text-xs">ADJUSTMENT</span>
                  <span className="text-[10px] text-slate-400 font-normal">Audit Correction</span>
                </button>
              </div>
            </div>

            {/* Quantity and Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity {transactionType === 'ADJUSTMENT' ? '(Signed Delta, e.g. +5 or -3)' : '(Positive Integer)'} *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#795548] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Description {(transactionType === 'DAMAGE' || transactionType === 'ADJUSTMENT') && '*'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Supplier PO-884, Customer sales, Audit diff"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#795548]"
                  required={transactionType === 'DAMAGE' || transactionType === 'ADJUSTMENT'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || willCauseNegative}
              className={`w-full py-3 text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                willCauseNegative
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-[#795548] hover:bg-[#4E342E] shadow-[#4E342E]/30'
              }`}
            >
              {isSubmitting ? 'Validating via Java Engine...' : 'Commit Transaction'}
            </button>
          </form>
        </div>

        {/* Real-time Projected Stock Card (1 col) */}
        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#795548]">Projected Balance</span>
            </div>

            {!currentProduct ? (
              <div className="py-8 px-4 text-center space-y-3 bg-[#FAF7F5] rounded-xl border border-[#E8DDD7]">
                <AlertCircle className="w-8 h-8 text-[#A1887F] mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {activeProducts.length === 0 ? 'No Active Inventory SKUs' : 'Select a Target SKU'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeProducts.length === 0
                      ? 'The product catalog is currently empty. Seed demo records or create products to simulate stock movements.'
                      : 'Choose an active product from the terminal dropdown to view live balance simulation.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div>
                  <div className="text-xs text-slate-500">Selected SKU</div>
                  <div className="font-bold text-base text-slate-900 truncate">{currentProduct.name}</div>
                  <div className="font-mono text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{currentProduct.id}</span>
                    <span className="text-[10px] bg-[#F1E7E2] text-[#6D4C41] px-1.5 py-0.5 rounded font-sans">
                      Unit: {currentProduct.unit || 'units'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 bg-[#FAF7F5] p-4 rounded-xl border border-[#E8DDD7]">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Current In-Stock:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {currentStock} {currentProduct.unit || 'units'}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Movement Delta:</span>
                    <span className={`font-mono font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-red-700'}`}>
                      {delta >= 0 ? `+${delta}` : `${delta}`} {currentProduct.unit || 'units'}
                    </span>
                  </div>

                  <div className="border-t border-[#E0D2CB] pt-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Projected Stock:</span>
                    <span className={`text-xl font-black font-mono ${willCauseNegative ? 'text-red-700 animate-pulse' : 'text-[#5D4037]'}`}>
                      {projectedStock} {currentProduct.unit || 'units'}
                    </span>
                  </div>
                </div>

                {willCauseNegative ? (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" /> Insufficient Stock
                    </p>
                    <p className="text-[11px]">Cannot reduce stock below 0. Java engine will reject this operation.</p>
                  </div>
                ) : (
                  <div className="p-3 bg-[#F6EEE9] border border-[#D7C0B4] text-[#6D4C41] rounded-xl text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#8D6E63] shrink-0" />
                    <span className="text-[11px]">Validated against inventory business invariants before persistence.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 text-[11px] text-slate-500 border-t border-[#E8DDD7]">
            Reorder threshold: <span className="font-mono text-[#5D4037]">{currentProduct?.reorderLevel || 0}</span> {currentProduct?.unit || 'units'}
          </div>
        </div>
      </div>

      {/* Historical Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Transaction Audit Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">TX ID</th>
                <th className="py-3 px-4">Item Name / SKU</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Movement</th>
                <th className="py-3 px-4">Prev → Result</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-medium text-slate-500">{tx.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{tx.productName}</div>
                      <div className="font-mono text-xs text-slate-400">{tx.productId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        tx.transactionType === 'STOCK_IN' ? 'bg-emerald-50 text-emerald-700' :
                        tx.transactionType === 'STOCK_OUT' ? 'bg-[#F3EEE7] text-[#5D4037]' :
                        tx.transactionType === 'DAMAGE' ? 'bg-rose-50 text-rose-700' :
                        'bg-[#F3EEE7] text-[#5D4037]'
                      }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={tx.transactionType === 'STOCK_IN' ? 'text-emerald-600' : 'text-slate-700'}>
                        {tx.transactionType === 'STOCK_IN' ? `+${tx.quantity}` : `${tx.quantity}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {tx.previousQuantity} → <span className="font-bold text-slate-800">{tx.resultingQuantity}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">{tx.reason || 'N/A'}</td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400 font-mono">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
