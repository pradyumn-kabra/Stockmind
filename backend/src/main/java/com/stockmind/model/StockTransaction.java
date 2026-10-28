package com.stockmind.model;

import com.stockmind.enums.TransactionType;

import java.time.LocalDateTime;

/**
 * Domain entity capturing an immutable historical stock transaction record.
 */
public class StockTransaction {
    private String id;
    private String productId;
    private TransactionType transactionType;
    private int quantity;
    private int previousQuantity;
    private int resultingQuantity;
    private String reason;
    private LocalDateTime createdAt;

    public StockTransaction() {
        this.createdAt = LocalDateTime.now();
    }

    public StockTransaction(String id, String productId, TransactionType transactionType,
                            int quantity, int previousQuantity, int resultingQuantity, String reason) {
        this.id = id;
        this.productId = productId;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.resultingQuantity = resultingQuantity;
        this.reason = reason;
        this.createdAt = LocalDateTime.now();
    }

    public StockTransaction(String id, String productId, TransactionType transactionType,
                            int quantity, int previousQuantity, int resultingQuantity, String reason,
                            LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.resultingQuantity = resultingQuantity;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getPreviousQuantity() {
        return previousQuantity;
    }

    public void setPreviousQuantity(int previousQuantity) {
        this.previousQuantity = previousQuantity;
    }

    public int getResultingQuantity() {
        return resultingQuantity;
    }

    public void setResultingQuantity(int resultingQuantity) {
        this.resultingQuantity = resultingQuantity;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "StockTransaction{" +
                "id='" + id + '\'' +
                ", productId='" + productId + '\'' +
                ", type=" + transactionType +
                ", qty=" + quantity +
                ", prev=" + previousQuantity +
                ", res=" + resultingQuantity +
                ", time=" + createdAt +
                '}';
    }
}
