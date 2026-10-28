package com.stockmind.dto;

import java.util.List;

public class DashboardSummaryResponse {
    private long totalActiveProducts;
    private double totalInventoryValuation;
    private long lowStockCount;
    private long openAlertsCount;
    private long totalTransactionsCount;
    private List<CategorySummaryResponse> categorySummaries;
    private List<TransactionResponse> recentTransactions;
    private List<ProductResponse> lowStockProducts;

    public DashboardSummaryResponse() {}

    public long getTotalActiveProducts() { return totalActiveProducts; }
    public void setTotalActiveProducts(long totalActiveProducts) { this.totalActiveProducts = totalActiveProducts; }
    public double getTotalInventoryValuation() { return totalInventoryValuation; }
    public void setTotalInventoryValuation(double totalInventoryValuation) { this.totalInventoryValuation = totalInventoryValuation; }
    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }
    public long getOpenAlertsCount() { return openAlertsCount; }
    public void setOpenAlertsCount(long openAlertsCount) { this.openAlertsCount = openAlertsCount; }
    public long getTotalTransactionsCount() { return totalTransactionsCount; }
    public void setTotalTransactionsCount(long totalTransactionsCount) { this.totalTransactionsCount = totalTransactionsCount; }
    public List<CategorySummaryResponse> getCategorySummaries() { return categorySummaries; }
    public void setCategorySummaries(List<CategorySummaryResponse> categorySummaries) { this.categorySummaries = categorySummaries; }
    public List<TransactionResponse> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<TransactionResponse> recentTransactions) { this.recentTransactions = recentTransactions; }
    public List<ProductResponse> getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(List<ProductResponse> lowStockProducts) { this.lowStockProducts = lowStockProducts; }
}
