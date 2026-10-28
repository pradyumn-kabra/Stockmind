package com.stockmind.entity;

import com.stockmind.enums.TransactionType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
public class StockTransactionEntity {
    @Id
    @Column(name = "transaction_id", length = 50, nullable = false)
    private String id;

    @Column(name = "product_id", length = 50, nullable = false)
    private String productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", length = 50, nullable = false)
    private TransactionType transactionType;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "previous_quantity", nullable = false)
    private int previousQuantity;

    @Column(name = "resulting_quantity", nullable = false)
    private int resultingQuantity;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public StockTransactionEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public StockTransactionEntity(String id, String productId, TransactionType transactionType,
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
}
