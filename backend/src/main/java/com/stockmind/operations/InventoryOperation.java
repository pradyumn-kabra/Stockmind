package com.stockmind.operations;

import com.stockmind.enums.TransactionType;
import com.stockmind.exceptions.InsufficientStockException;
import com.stockmind.exceptions.InvalidTransactionException;
import com.stockmind.model.Product;

/**
 * [VIVA SEARCH: ABSTRACTION] & [VIVA SEARCH: STRATEGY PATTERN] & [VIVA SEARCH: POLYMORPHISM]
 * Polymorphic interface contract for all inventory mutations.
 * Implements the Strategy Pattern: decouples transaction orchestration from mutation math.
 * Implementations: StockInOperation, StockOutOperation, DamageOperation, StockAdjustmentOperation.
 */
public interface InventoryOperation {
    /**
     * [VIVA SEARCH: DYNAMIC DISPATCH]
     * Executes the specific mutation against the target product domain model, enforcing invariants.
     */
    void execute(Product product) throws InsufficientStockException, InvalidTransactionException;

    /**
     * Returns the type of transaction.
     */
    TransactionType getType();

    /**
     * Returns the quantity movement.
     */
    int getQuantity();

    /**
     * Returns the rationale or description for the transaction.
     */
    String getReason();
}
