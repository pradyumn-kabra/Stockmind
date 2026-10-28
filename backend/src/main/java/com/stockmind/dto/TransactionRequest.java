package com.stockmind.dto;

import com.stockmind.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TransactionRequest {
    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    private int quantity;

    private String reason;

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
