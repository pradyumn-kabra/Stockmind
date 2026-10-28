"use client";

import React, { useState } from 'react';
import {
  Upload,
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { CsvImportResult } from '../types';
import { api } from '../lib/api';

interface SettingsViewProps {
  onRefreshAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshAll }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
      setImportError(null);
    }
  };

  const handleUploadCsv = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      setImportError(null);
      const res = await api.importCsv(selectedFile);
      setImportResult(res);
      setSelectedFile(null);
      onRefreshAll();
    } catch (err: any) {
      setImportError(err.message || 'CSV Import failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setIsSeeding(true);
      setSeedMessage(null);
      const res = await api.seedDemoData();
      setSeedMessage(res.message);
      onRefreshAll();
    } catch (err: any) {
      setSeedMessage('Failed to seed demo data: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Database className="w-5 h-5 text-[#795548]" />
          Data Management & Configuration
        </h3>
        <p className="text-xs text-slate-500">
          Manage bulk CSV imports, idempotent demo datasets, and database configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CSV Import Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#795548]" /> Bulk Product CSV Import
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Import catalog records.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 hover:border-[#A88970] transition-colors">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-600">
              <label className="font-bold text-[#795548] hover:text-[#4E342E] cursor-pointer">
                <span>Select a CSV file</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-slate-400 mt-1">UTF-8 encoded .csv with product headers</p>
            </div>
            {selectedFile && (
              <div className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 py-1.5 px-3 rounded-lg inline-block">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <button
            onClick={handleUploadCsv}
            disabled={!selectedFile || isUploading}
            className="w-full py-2.5 text-xs font-bold text-white bg-[#795548] hover:bg-[#4E342E] rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isUploading ? 'Validating & Importing via Java Backend...' : 'Start CSV Import'}
          </button>

          {importError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importResult && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Import Summary:</span>
                <span>{importResult.successfulRows} / {importResult.totalRows} Processed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-semibold">
                  ✓ Successful: {importResult.successfulRows} rows
                </div>
                <div className="p-2 bg-rose-50 text-rose-800 rounded border border-rose-200 font-semibold">
                  ✕ Rejected: {importResult.failedRows} rows
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="font-semibold text-rose-700">Validation Failures:</span>
                  <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-600">
                    {importResult.errors.map((err, idx) => (
                      <div key={idx} className="bg-white p-1 rounded border border-slate-200">
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo Dataset & Architecture Card */}
        <div className="space-y-6">
          {/* Demo Data Seeder */}
          <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col">
            <div>
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Idempotent Demo Data Seeder
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Populates 35+ realistic products across 6 categories, 5 suppliers, and initial stock movements.
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong>Safe Execution Guarantee:</strong> Repeated execution will not create duplicate products or overwrite existing transaction histories. Real inventory records remain preserved.
            </p>

            <button
              onClick={handleSeedDemo}
              disabled={isSeeding}
              className="mt-auto w-full py-2.5 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{isSeeding ? 'Seeding Catalog & Movements...' : 'Load 35+ Demo Records'}</span>
            </button>

            {seedMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{seedMessage}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
