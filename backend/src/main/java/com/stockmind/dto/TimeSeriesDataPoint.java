package com.stockmind.dto;

public class TimeSeriesDataPoint {
    private String label;
    private String date;
    private double stockInValuation;
    private double stockOutValuation;
    private double netValuationChange;
    private double totalPortfolioValuation;
    private int inboundMovementsCount;
    private int outboundMovementsCount;

    public TimeSeriesDataPoint() {}

    public TimeSeriesDataPoint(String label, String date, double stockInValuation, double stockOutValuation,
                               double netValuationChange, double totalPortfolioValuation,
                               int inboundMovementsCount, int outboundMovementsCount) {
        this.label = label;
        this.date = date;
        this.stockInValuation = stockInValuation;
        this.stockOutValuation = stockOutValuation;
        this.netValuationChange = netValuationChange;
        this.totalPortfolioValuation = totalPortfolioValuation;
        this.inboundMovementsCount = inboundMovementsCount;
        this.outboundMovementsCount = outboundMovementsCount;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public double getStockInValuation() { return stockInValuation; }
    public void setStockInValuation(double stockInValuation) { this.stockInValuation = stockInValuation; }

    public double getStockOutValuation() { return stockOutValuation; }
    public void setStockOutValuation(double stockOutValuation) { this.stockOutValuation = stockOutValuation; }

    public double getNetValuationChange() { return netValuationChange; }
    public void setNetValuationChange(double netValuationChange) { this.netValuationChange = netValuationChange; }

    public double getTotalPortfolioValuation() { return totalPortfolioValuation; }
    public void setTotalPortfolioValuation(double totalPortfolioValuation) { this.totalPortfolioValuation = totalPortfolioValuation; }

    public int getInboundMovementsCount() { return inboundMovementsCount; }
    public void setInboundMovementsCount(int inboundMovementsCount) { this.inboundMovementsCount = inboundMovementsCount; }

    public int getOutboundMovementsCount() { return outboundMovementsCount; }
    public void setOutboundMovementsCount(int outboundMovementsCount) { this.outboundMovementsCount = outboundMovementsCount; }
}
