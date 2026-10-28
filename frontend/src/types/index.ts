export type ProductType = 'STANDARD' | 'PERISHABLE' | 'ELECTRONIC';
export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'DAMAGE' | 'ADJUSTMENT';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED';

export interface Product {
  id: string;
  name: string;
  category: string;
  productType: ProductType;
  price: number;
  quantity: number;
  unit?: string;
  reorderLevel: number;
  supplierId?: string;
  active: boolean;
  replenishmentNeeded: boolean;
  suggestedReorderQuantity: number;
  inventoryValuation: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
  expired?: boolean;
  warrantyMonths?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  id: string;
  name: string;
  category: string;
  productType: ProductType;
  price: number;
  quantity: number;
  unit?: string;
  reorderLevel: number;
  supplierId?: string;
  expiryDate?: string;
  warrantyMonths?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  associatedProductCount: number;
}

export interface SupplierRequest {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  transactionType: TransactionType;
  quantity: number;
  previousQuantity: number;
  resultingQuantity: number;
  reason?: string;
  createdAt: string;
  flaggedAsAnomaly: boolean;
  anomalyExplanation?: string;
}

export interface TransactionRequest {
  productId: string;
  transactionType: TransactionType;
  quantity: number;
  reason?: string;
}

export interface AnomalyAlert {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  severity: AlertSeverity;
  ruleCode: string;
  score?: number;
  explanation: string;
  status: AlertStatus;
  createdAt: string;
  reviewedAt?: string;
}

export interface CategorySummary {
  category: string;
  productCount: number;
  totalQuantity: number;
  totalValuation: number;
}

export interface DashboardSummary {
  totalActiveProducts: number;
  totalInventoryValuation: number;
  lowStockCount: number;
  openAlertsCount: number;
  totalTransactionsCount: number;
  categorySummaries: CategorySummary[];
  recentTransactions: StockTransaction[];
  lowStockProducts: Product[];
}

export interface CsvImportResult {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
}

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'CONNECTING';
  database: 'CONNECTED' | 'DISCONNECTED';
  trackedSkus?: number;
  profile?: string;
  timestamp?: string;
}

export interface TimeSeriesDataPoint {
  label: string;
  date: string;
  stockInValuation: number;
  stockOutValuation: number;
  netValuationChange: number;
  totalPortfolioValuation: number;
  inboundMovementsCount: number;
  outboundMovementsCount: number;
}

