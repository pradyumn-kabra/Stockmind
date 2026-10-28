package com.stockmind.operations;

import com.stockmind.enums.TransactionType;
import com.stockmind.exceptions.InsufficientStockException;
import com.stockmind.exceptions.InvalidTransactionException;
import com.stockmind.model.Product;

/**
 * [VIVA SEARCH: POLYMORPHISM] & [VIVA SEARCH: STRATEGY PATTERN]
 * Concrete operation for stock issues, sales, or outbound orders.
 * Implements InventoryOperation interface.
 * Enforces negative-stock prevention before modifying the balance.
 */
public class StockOutOperation implements InventoryOperation {
    private final int quantity;
    private final String reason;

    public StockOutOperation(int quantity, String reason) {
        if (quantity <= 0) {
            throw new InvalidTransactionException("Stock-out quantity must be positive. Provided: " + quantity);
        }
        this.quantity = quantity;
        this.reason = (reason == null || reason.trim().isEmpty()) ? "Stock dispatched" : reason.trim();
    }

    // [VIVA SEARCH: NEGATIVE STOCK PREVENTION] & [VIVA SEARCH: INSUFFICIENT STOCK]
    // Crucial business rule: Throws InsufficientStockException if requested dispatch exceeds available stock.
    // This triggers Spring's @Transactional rollback to prevent balance corruption.
    @Override
    public void execute(Product product) throws InsufficientStockException {
        if (product == null) {
            throw new InvalidTransactionException("Target product cannot be null.");
        }
        if (!product.isActive()) {
            throw new InvalidTransactionException("Cannot execute stock-out on inactive product: " + product.getId());
        }
        // [VIVA SEARCH: INVARIANT CHECK]
        if (product.getQuantity() < quantity) {
            throw new InsufficientStockException(product.getId(), quantity, product.getQuantity());
        }
        int newQuantity = product.getQuantity() - quantity;
        product.setQuantity(newQuantity);
    }

    @Override
    public TransactionType getType() {
        return TransactionType.STOCK_OUT;
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
