"use client";

import React from 'react';
import { RefreshCw, Sparkles, Plus, ArrowLeftRight } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onOpenTransaction?: () => void;
  onOpenNewProduct?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  onOpenTransaction,
  onOpenNewProduct,
  isRefreshing = false,
}) => {
  return (
    <header className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Refresh Data from Server"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#795548]' : ''}`} />
          </button>
        )}

        {onOpenTransaction && (
          <button
            onClick={onOpenTransaction}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Record Movement</span>
          </button>
        )}

        {onOpenNewProduct && (
          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors shadow-sm shadow-[#4E342E]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        )}
      </div>
    </header>
  );
};
