package com.stockmind.operations;

import com.stockmind.enums.TransactionType;
import com.stockmind.exceptions.InsufficientStockException;
import com.stockmind.exceptions.InvalidTransactionException;
import com.stockmind.model.Product;

/**
 * Concrete operation for inventory reconciliation and audit adjustments.
 * Supports signed adjustments (+ or -) with mandatory rationale.
 * Demonstrates Polymorphism and complex boundary checking.
 */
public class StockAdjustmentOperation implements InventoryOperation {
    private final int delta;
    private final String reason;

    public StockAdjustmentOperation(int delta, String reason) {
        if (delta == 0) {
            throw new InvalidTransactionException("Adjustment delta cannot be zero.");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new InvalidTransactionException("A detailed rationale is required for inventory adjustments.");
        }
        this.delta = delta;
        this.reason = reason.trim();
    }

    @Override
    public void execute(Product product) throws InsufficientStockException {
        if (product == null) {
            throw new InvalidTransactionException("Target product cannot be null.");
        }
        if (!product.isActive()) {
            throw new InvalidTransactionException("Cannot adjust stock for inactive product: " + product.getId());
        }
        int resultingQuantity = product.getQuantity() + delta;
        if (resultingQuantity < 0) {
            throw new InsufficientStockException(product.getId(), Math.abs(delta), product.getQuantity());
        }
        product.setQuantity(resultingQuantity);
    }

    @Override
    public TransactionType getType() {
        return TransactionType.ADJUSTMENT;
    }

    @Override
    public int getQuantity() {
        return delta;
    }

    @Override
    public String getReason() {
        return reason;
    }
}
