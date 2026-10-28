package com.stockmind.dto;

import com.stockmind.enums.TransactionType;
import com.stockmind.model.StockTransaction;

import java.time.LocalDateTime;

public class TransactionResponse {
    private String id;
    private String productId;
    private String productName;
    private TransactionType transactionType;
    private int quantity;
    private int previousQuantity;
    private int resultingQuantity;
    private String reason;
    private LocalDateTime createdAt;
    private boolean flaggedAsAnomaly;
    private String anomalyExplanation;

    public static TransactionResponse fromDomain(StockTransaction tx, String productName, boolean flagged, String explanation) {
        if (tx == null) return null;
        TransactionResponse resp = new TransactionResponse();
        resp.id = tx.getId();
        resp.productId = tx.getProductId();
        resp.productName = productName;
        resp.transactionType = tx.getTransactionType();
        resp.quantity = tx.getQuantity();
        resp.previousQuantity = tx.getPreviousQuantity();
        resp.resultingQuantity = tx.getResultingQuantity();
        resp.reason = tx.getReason();
        resp.createdAt = tx.getCreatedAt();
        resp.flaggedAsAnomaly = flagged;
        resp.anomalyExplanation = explanation;
        return resp;
    }

    public String getId() { return id; }
    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public TransactionType getTransactionType() { return transactionType; }
    public int getQuantity() { return quantity; }
    public int getPreviousQuantity() { return previousQuantity; }
    public int getResultingQuantity() { return resultingQuantity; }
    public String getReason() { return reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isFlaggedAsAnomaly() { return flaggedAsAnomaly; }
    public String getAnomalyExplanation() { return anomalyExplanation; }
}
