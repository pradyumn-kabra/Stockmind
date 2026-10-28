import {
  DashboardSummary,
  Product,
  ProductRequest,
  Supplier,
  SupplierRequest,
  StockTransaction,
  TransactionRequest,
  AnomalyAlert,
  AlertStatus,
  CsvImportResult,
  HealthStatus,
  TimeSeriesDataPoint
} from '../types';
import { createClient } from './supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// [VIVA SEARCH: JWT BEARER INJECTION] & [VIVA SEARCH: AUTH HEADER]
// Extracts Supabase session access token and formats it as an RFC 6750 Bearer token for Spring Security.
async function getAuthorizationHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await createClient().auth.getSession();

  if (!session?.access_token) {
    throw new Error('Your session has expired. Please log in again.');
  }

  return { Authorization: `Bearer ${session.access_token}` };
}

// [VIVA SEARCH: HTTP CLIENT & 401 EXPIRATION HANDLER]
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const authorizationHeader = await getAuthorizationHeader();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authorizationHeader,
      ...(options?.headers || {}),
    },
  });

  if (res.status === 401) {
    await createClient().auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.assign('/login');
    }
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!res.ok) {
    let errorMsg = `Error ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch (e) {
      // ignore
    }
    throw new Error(errorMsg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Dashboard & Analytics
  getDashboardSummary: () => request<DashboardSummary>('/reports/dashboard'),
  getTimeSeries: (range?: string) => {
    const qs = range ? `?range=${encodeURIComponent(range)}` : '';
    return request<TimeSeriesDataPoint[]>(`/reports/timeseries${qs}`);
  },

  // Products
  getProducts: (query?: string, category?: string, active?: boolean) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    if (active !== undefined) params.append('active', String(active));
    const qs = params.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  getProductById: (id: string) => request<Product>(`/products/${id}`),

  createProduct: (data: ProductRequest) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: ProductRequest) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deactivateProduct: (id: string) =>
    request<void>(`/products/${id}`, {
      method: 'DELETE',
    }),

  getProductTransactions: (id: string) =>
    request<StockTransaction[]>(`/products/${id}/transactions`),

  // Suppliers
  getSuppliers: (query?: string) => {
    const qs = query ? `?query=${encodeURIComponent(query)}` : '';
    return request<Supplier[]>(`/suppliers${qs}`);
  },

  createSupplier: (data: SupplierRequest) =>
    request<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSupplier: (id: string, data: SupplierRequest) =>
    request<Supplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Transactions
  getTransactions: (productId?: string) => {
    const qs = productId ? `?productId=${encodeURIComponent(productId)}` : '';
    return request<StockTransaction[]>(`/transactions${qs}`);
  },

  submitTransaction: (data: TransactionRequest) =>
    request<StockTransaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Alerts
  getAlerts: (status?: AlertStatus) => {
    const qs = status ? `?status=${status}` : '';
    return request<AnomalyAlert[]>(`/alerts${qs}`);
  },

  updateAlertStatus: (id: string, status: AlertStatus) =>
    request<AnomalyAlert>(`/alerts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // CSV
  importCsv: async (file: File): Promise<CsvImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const authorizationHeader = await getAuthorizationHeader();
    const res = await fetch(`${BASE_URL}/csv/import`, {
      method: 'POST',
      body: formData,
      headers: authorizationHeader,
    });
    if (res.status === 401) {
      await createClient().auth.signOut();
      window.location.assign('/login');
      throw new Error('Your session has expired. Please log in again.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'CSV Import failed');
    }
    return res.json();
  },

  // Demo Seeder
  seedDemoData: () =>
    request<{ status: string; message: string; productsSeeded: number; suppliersSeeded: number; transactionsSeeded: number }>(
      '/demo/seed',
      { method: 'POST' }
    ),

  // Health Heartbeat
  checkHealth: () => request<HealthStatus>('/health'),
};
