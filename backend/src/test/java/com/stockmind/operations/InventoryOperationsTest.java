package com.stockmind.operations;

import com.stockmind.enums.TransactionType;
import com.stockmind.exceptions.InsufficientStockException;
import com.stockmind.exceptions.InvalidTransactionException;
import com.stockmind.model.StandardProduct;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Polymorphic Inventory Operations Tests")
class InventoryOperationsTest {

    private StandardProduct product;

    @BeforeEach
    void setUp() {
        product = new StandardProduct("P-ITEM-101", "Wireless Mouse", "Accessories", 25.0, 50, 10, "SUPP-LOGI");
    }

    @Test
    @DisplayName("StockInOperation should increase quantity correctly")
    void testStockInOperation() {
        InventoryOperation stockIn = new StockInOperation(20, "Batch arrival from supplier");

        assertEquals(TransactionType.STOCK_IN, stockIn.getType());
        assertEquals(20, stockIn.getQuantity());

        stockIn.execute(product);
        assertEquals(70, product.getQuantity());
    }

    @Test
    @DisplayName("StockInOperation should reject zero or negative quantities")
    void testStockInInvalidQuantity() {
        assertThrows(InvalidTransactionException.class, () -> new StockInOperation(0, "Invalid zero"));
        assertThrows(InvalidTransactionException.class, () -> new StockInOperation(-5, "Invalid negative"));
    }

    @Test
    @DisplayName("StockOutOperation should decrease quantity when stock is available")
    void testStockOutOperationSuccess() {
        InventoryOperation stockOut = new StockOutOperation(15, "Customer Order #4920");

        assertEquals(TransactionType.STOCK_OUT, stockOut.getType());
        assertEquals(15, stockOut.getQuantity());

        stockOut.execute(product);
        assertEquals(35, product.getQuantity());
    }

    @Test
    @DisplayName("StockOutOperation must reject order if quantity exceeds available stock")
    void testStockOutInsufficientStock() {
        InventoryOperation excessiveStockOut = new StockOutOperation(60, "Excessive request");

        InsufficientStockException exception = assertThrows(
                InsufficientStockException.class,
                () -> excessiveStockOut.execute(product),
                "Should throw InsufficientStockException when stock is insufficient"
        );

        assertEquals("P-ITEM-101", exception.getProductId());
        assertEquals(60, exception.getRequested());
        assertEquals(50, exception.getAvailable());
        assertEquals(50, product.getQuantity(), "Quantity must remain untouched upon failure");
    }

    @Test
    @DisplayName("DamageOperation should deduct damaged stock and require specific rationale")
    void testDamageOperation() {
        assertThrows(InvalidTransactionException.class, () -> new DamageOperation(5, ""), "Damage reason is mandatory");

        InventoryOperation damage = new DamageOperation(3, "Water damage in warehouse aisle 4");
        assertEquals(TransactionType.DAMAGE, damage.getType());

        damage.execute(product);
        assertEquals(47, product.getQuantity());

        // Attempting to write off more damage than available stock
        InventoryOperation excessiveDamage = new DamageOperation(100, "Severe destruction");
        assertThrows(InsufficientStockException.class, () -> excessiveDamage.execute(product));
    }

    @Test
    @DisplayName("StockAdjustmentOperation should support signed adjustments and prevent negative stock")
    void testStockAdjustmentOperation() {
        assertThrows(InvalidTransactionException.class, () -> new StockAdjustmentOperation(0, "Zero change"));
        assertThrows(InvalidTransactionException.class, () -> new StockAdjustmentOperation(5, "   "));

        // Positive adjustment (found extra items in count)
        InventoryOperation positiveAdj = new StockAdjustmentOperation(5, "Cycle count found 5 untracked units");
        assertEquals(TransactionType.ADJUSTMENT, positiveAdj.getType());
        assertEquals(5, positiveAdj.getQuantity());

        positiveAdj.execute(product);
        assertEquals(55, product.getQuantity());

        // Negative adjustment (shrinkage)
        InventoryOperation negativeAdj = new StockAdjustmentOperation(-10, "Cycle count shrinkage adjustment");
        negativeAdj.execute(product);
        assertEquals(45, product.getQuantity());

        // Negative adjustment exceeding available stock
        InventoryOperation excessiveNegative = new StockAdjustmentOperation(-50, "Excessive reduction");
        assertThrows(InsufficientStockException.class, () -> excessiveNegative.execute(product));
        assertEquals(45, product.getQuantity());
    }

    @Test
    @DisplayName("Operations on inactive products should be strictly rejected")
    void testOperationsOnInactiveProduct() {
        product.setActive(false);

        InventoryOperation stockIn = new StockInOperation(10, "Attempt on inactive");
        assertThrows(InvalidTransactionException.class, () -> stockIn.execute(product));

        InventoryOperation stockOut = new StockOutOperation(5, "Attempt on inactive");
        assertThrows(InvalidTransactionException.class, () -> stockOut.execute(product));
    }
}
