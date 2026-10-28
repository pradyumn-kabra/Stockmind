"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { ProductsView } from '@/components/ProductsView';
import { ProductModal } from '@/components/ProductModal';
import { TransactionsView } from '@/components/TransactionsView';
import { AlertsView } from '@/components/AlertsView';
import { SuppliersView } from '@/components/SuppliersView';
import { ReportsView } from '@/components/ReportsView';
import { SettingsView } from '@/components/SettingsView';
import {
  DashboardSummary,
  Product,
  ProductRequest,
  Supplier,
  SupplierRequest,
  StockTransaction,
  AnomalyAlert,
  AlertStatus
} from '@/types';
import { api } from '@/lib/api';

export default function StockMindOperationalWorkspace() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [productStatusFilter, setProductStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Core Data State
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch all state from Java backend
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const [sumData, prodsData, suppsData, txsData, alertsData] = await Promise.all([
        api.getDashboardSummary().catch((e) => {
          console.error("Failed loading summary:", e);
          return null;
        }),
        api.getProducts().catch((e) => {
          console.error("Failed loading products:", e);
          return [];
        }),
        api.getSuppliers().catch((e) => {
          console.error("Failed loading suppliers:", e);
          return [];
        }),
        api.getTransactions().catch((e) => {
          console.error("Failed loading transactions:", e);
          return [];
        }),
        api.getAlerts().catch((e) => {
          console.error("Failed loading alerts:", e);
          return [];
        }),
      ]);

      if (sumData) setSummary(sumData);
      setProducts(prodsData);
      setSuppliers(suppsData);
      setTransactions(txsData);
      setAlerts(alertsData);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to communicate with Java backend');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Product Operations
  const handleSaveProduct = async (data: ProductRequest) => {
    if (editingProduct) {
      await api.updateProduct(editingProduct.id, data);
    } else {
      await api.createProduct(data);
    }
    await loadData();
  };

  const handleDeactivateProduct = async (id: string) => {
    await api.deactivateProduct(id);
    await loadData();
  };

  // Supplier Operations
  const handleSaveSupplier = async (data: SupplierRequest, isEdit: boolean) => {
    if (isEdit) {
      await api.updateSupplier(data.id, data);
    } else {
      await api.createSupplier(data);
    }
    await loadData();
  };

  // Alert Operations
  const handleUpdateAlertStatus = async (alertId: string, status: AlertStatus) => {
    await api.updateAlertStatus(alertId, status);
    await loadData();
  };

  // Demo Seeding
  const handleSeedDemo = async () => {
    try {
      setIsSeeding(true);
      await api.seedDemoData();
      await loadData();
    } finally {
      setIsSeeding(false);
    }
  };

  // Tab Details
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Operational Dashboard', subtitle: 'Live inventory metrics, replenishment warnings, and asset valuation' };
      case 'products':
        return { title: 'Product Catalog Management', subtitle: 'Maintain SKUs, reorder thresholds, expiry dates, and warranties' };
      case 'suppliers':
        return { title: 'Supplier Directory', subtitle: 'Vendor contacts, procurement relationships, and associated catalog items' };
      case 'transactions':
        return { title: 'Stock Movement Terminal', subtitle: 'Submit receipts, dispatches, write-offs, and adjustments with live simulation' };
      case 'alerts':
        return { title: 'Anomaly Detection Review Center', subtitle: 'Inspect and resolve unusual stock movements flagged by explainable Java logic' };
      case 'reports':
        return { title: 'Inventory Analytics & Valuation', subtitle: 'Category breakdowns, turnover velocity, and CSV exports' };
      case 'settings':
        return { title: 'Data Management & Configuration', subtitle: 'Bulk CSV importing, demo dataset seeding, and database connection status' };
      default:
        return { title: 'StockMind', subtitle: '' };
    }
  };

  const { title, subtitle } = getTabTitle();
  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;
  const lowStockCount = products.filter((p) => p.replenishmentNeeded).length;

  const handleNavigate = (tab: string, filter?: string) => {
    if (tab === 'products') {
      setProductStatusFilter(filter || 'ALL');
    }
    setCurrentTab(tab);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => handleNavigate(tab, 'ALL')}
        openAlertsCount={openAlertsCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onRefresh={loadData}
          onOpenTransaction={() => setCurrentTab('transactions')}
          onOpenNewProduct={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          isRefreshing={isRefreshing}
        />

        {loadError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-xs text-rose-700 flex items-center justify-between">
            <span>Warning: {loadError}. Ensure Java backend is running on port 8080.</span>
            <button
              onClick={loadData}
              className="text-xs font-bold underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic View Scroll Container */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              onNavigate={handleNavigate}
              onSeedDemo={handleSeedDemo}
              isSeeding={isSeeding}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              initialStatusFilter={productStatusFilter}
              onOpenCreate={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onDeactivateProduct={handleDeactivateProduct}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              onSaveSupplier={handleSaveSupplier}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              products={products}
              transactions={transactions}
              onTransactionComplete={loadData}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onUpdateStatus={handleUpdateAlertStatus}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView summary={summary} />
          )}

          {currentTab === 'settings' && (
            <SettingsView onRefreshAll={loadData} />
          )}
        </main>
      </div>

      {/* Product Creation / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        suppliers={suppliers}
      />
    </div>
  );
}
