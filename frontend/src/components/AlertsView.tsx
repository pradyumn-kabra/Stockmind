"use client";

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  Eye,
  AlertTriangle,
  Info,
  Clock,
  Check,
  Ban
} from 'lucide-react';
import { AnomalyAlert, AlertStatus, AlertSeverity } from '../types';

interface AlertsViewProps {
  alerts: AnomalyAlert[];
  onUpdateStatus: (alertId: string, status: AlertStatus) => Promise<void>;
  onRefresh: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onUpdateStatus,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<AlertStatus | 'ALL'>('ALL');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filtered = alerts.filter((a) => (filter === 'ALL' ? true : a.status === filter));

  const handleStatusChange = async (id: string, status: AlertStatus) => {
    try {
      setIsUpdating(id);
      await onUpdateStatus(id, status);
      onRefresh();
    } finally {
      setIsUpdating(null);
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW':
        return 'bg-[#EDE4D9] text-[#4E342E] border-[#C7A992]';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Explanation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Explainable Anomaly Detection Center
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Flagged by Layer A (business heuristics) & Layer B (pure Java statistical Z-score baseline).
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['ALL', 'OPEN', 'REVIEWED', 'DISMISSED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No anomalies matching this filter</p>
          <p className="text-xs text-slate-400">All inventory movements adhere to regular operational baselines.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((alert) => {
            const isOpen = alert.status === 'OPEN';
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                  isOpen ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Severity & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="font-mono text-xs text-slate-400">{alert.ruleCode}</span>
                    </div>

                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      alert.status === 'OPEN' ? 'bg-rose-50 text-rose-700 font-bold' :
                      alert.status === 'REVIEWED' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  {/* Explainable Rationale */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#795548] shrink-0" />
                      Algorithmic Detection Rationale:
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.explanation}</p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                    <div>
                      <span className="text-slate-400">Alert ID:</span> <span className="font-mono font-medium">{alert.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Transaction:</span> <span className="font-mono font-medium">{alert.transactionId}</span>
                    </div>
                    {alert.score && (
                      <div>
                        <span className="text-slate-400">Score / Z:</span>{' '}
                        <span className="font-mono font-bold text-[#795548]">{alert.score.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isOpen && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleStatusChange(alert.id, 'DISMISSED')}
                      disabled={isUpdating === alert.id}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" /> Dismiss
                    </button>
                    <button
                      onClick={() => handleStatusChange(alert.id, 'REVIEWED')}
                      disabled={isUpdating === alert.id}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#795548] hover:bg-[#4E342E] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Reviewed
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
