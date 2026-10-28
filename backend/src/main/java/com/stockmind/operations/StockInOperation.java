package com.stockmind.operations;

import com.stockmind.enums.TransactionType;
import com.stockmind.exceptions.InvalidTransactionException;
import com.stockmind.model.Product;

/**
 * Concrete operation for stock receipts or replenishment.
 * Demonstrates Polymorphism and validated stock addition.
 */
public class StockInOperation implements InventoryOperation {
    private final int quantity;
    private final String reason;

    public StockInOperation(int quantity, String reason) {
        if (quantity <= 0) {
            throw new InvalidTransactionException("Stock-in quantity must be positive. Provided: " + quantity);
        }
        this.quantity = quantity;
        this.reason = (reason == null || reason.trim().isEmpty()) ? "Stock replenished" : reason.trim();
    }

    @Override
    public void execute(Product product) {
        if (product == null) {
            throw new InvalidTransactionException("Target product cannot be null.");
        }
        if (!product.isActive()) {
            throw new InvalidTransactionException("Cannot execute stock-in on inactive product: " + product.getId());
        }
        int newQuantity = product.getQuantity() + quantity;
        product.setQuantity(newQuantity);
    }

    @Override
    public TransactionType getType() {
        return TransactionType.STOCK_IN;
    }

    @Override
    public int getQuantity() {
        return quantity;
    }

    @Override
    public String getReason() {
        return reason;
    }
}
