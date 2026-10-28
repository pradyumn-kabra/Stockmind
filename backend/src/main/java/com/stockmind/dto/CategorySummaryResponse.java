package com.stockmind.dto;

public class CategorySummaryResponse {
    private String category;
    private long productCount;
    private int totalQuantity;
    private double totalValuation;

    public CategorySummaryResponse(String category, long productCount, int totalQuantity, double totalValuation) {
        this.category = category;
        this.productCount = productCount;
        this.totalQuantity = totalQuantity;
        this.totalValuation = totalValuation;
    }

    public String getCategory() { return category; }
    public long getProductCount() { return productCount; }
    public int getTotalQuantity() { return totalQuantity; }
    public double getTotalValuation() { return totalValuation; }
}
