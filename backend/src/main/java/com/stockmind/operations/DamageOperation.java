package com.stockmind.operations;

import com.stockmind.enums.TransactionType;
import com.stockmind.exceptions.InsufficientStockException;
import com.stockmind.exceptions.InvalidTransactionException;
import com.stockmind.model.Product;

/**
 * Concrete operation for damaged, expired, or written-off inventory.
 * Demonstrates Polymorphism and reason validation.
 */
public class DamageOperation implements InventoryOperation {
    private final int quantity;
    private final String reason;

    public DamageOperation(int quantity, String reason) {
        if (quantity <= 0) {
            throw new InvalidTransactionException("Damage write-off quantity must be positive. Provided: " + quantity);
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new InvalidTransactionException("A specific reason is required for damage write-offs.");
        }
        this.quantity = quantity;
        this.reason = reason.trim();
    }

    @Override
    public void execute(Product product) throws InsufficientStockException {
        if (product == null) {
            throw new InvalidTransactionException("Target product cannot be null.");
        }
        if (!product.isActive()) {
            throw new InvalidTransactionException("Cannot write off damaged stock for inactive product: " + product.getId());
        }
        if (product.getQuantity() < quantity) {
            throw new InsufficientStockException(product.getId(), quantity, product.getQuantity());
        }
        int newQuantity = product.getQuantity() - quantity;
        product.setQuantity(newQuantity);
    }

    @Override
    public TransactionType getType() {
        return TransactionType.DAMAGE;
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
