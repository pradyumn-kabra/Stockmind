package com.stockmind.model;

import com.stockmind.enums.ProductType;
import com.stockmind.exceptions.ValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Product Model OOP & Validation Tests")
class ProductModelTest {

    @Test
    @DisplayName("PerishableProduct should encapsulate expiry date and override replenishment checks")
    void testPerishableProductBehavior() {
        LocalDate futureExpiry = LocalDate.now().plusDays(30);
        PerishableProduct milk = new PerishableProduct(
                "P-MILK-1", "Organic Whole Milk", "Dairy",
                3.50, 25, 10, "SUPP-DAIRY", futureExpiry
        );

        assertEquals(ProductType.PERISHABLE, milk.getProductType());
        assertFalse(milk.isExpired());
        assertTrue(milk.getDaysUntilExpiry() >= 29);
        assertFalse(milk.isReplenishmentNeeded(), "Should not need replenishment when quantity > reorderLevel and not expired");
        assertEquals(25 * 3.50, milk.getInventoryValuation(), 0.001);

        // When stock drops below reorder level
        milk.setQuantity(5);
        assertTrue(milk.isReplenishmentNeeded(), "Should need replenishment when stock is at or below reorder level");
        assertEquals(45, milk.calculateSuggestedReorder(50));

        // When expired even if stock is plentiful
        milk.setQuantity(100);
        milk.setExpiryDate(LocalDate.now().minusDays(1));
        assertTrue(milk.isExpired());
        assertTrue(milk.isReplenishmentNeeded(), "Perishable item should flag replenishment if expired");
    }

    @Test
    @DisplayName("ElectronicProduct should encapsulate warranty period and validate coverage")
    void testElectronicProductBehavior() {
        ElectronicProduct laptop = new ElectronicProduct(
                "P-LAP-1", "ThinkPad Pro", "Electronics",
                1200.00, 15, 5, "SUPP-TECH", 24
        );

        assertEquals(ProductType.ELECTRONIC, laptop.getProductType());
        assertEquals(24, laptop.getWarrantyMonths());
        assertTrue(laptop.isUnderWarranty(12));
        assertTrue(laptop.isUnderWarranty(24));
        assertFalse(laptop.isUnderWarranty(25));
        assertFalse(laptop.isReplenishmentNeeded());

        laptop.setQuantity(4);
        assertTrue(laptop.isReplenishmentNeeded());
        assertEquals(16, laptop.calculateSuggestedReorder(20));
    }

    @Test
    @DisplayName("StandardProduct should validate common invariants and reject negative values")
    void testStandardProductInvariants() {
        StandardProduct chair = new StandardProduct(
                "P-CHAIR-1", "Ergonomic Desk Chair", "Furniture",
                150.00, 12, 4, "SUPP-FURN"
        );

        assertDoesNotThrow(chair::validate);

        assertThrows(ValidationException.class, () -> chair.setPrice(-10.0), "Price must not be negative");
        assertThrows(ValidationException.class, () -> chair.setQuantity(-5), "Quantity must not be negative");
        assertThrows(ValidationException.class, () -> chair.setReorderLevel(-1), "Reorder level must not be negative");
    }

    @Test
    @DisplayName("Validation should fail if mandatory fields are missing")
    void testMissingMandatoryFields() {
        StandardProduct invalidProduct = new StandardProduct();
        assertThrows(ValidationException.class, invalidProduct::validate);

        PerishableProduct missingExpiry = new PerishableProduct(
                "P-YOGURT", "Greek Yogurt", "Dairy", 2.0, 10, 5, "SUPP-1", null
        );
        assertThrows(ValidationException.class, missingExpiry::validate, "Expiry date is mandatory for perishable products");
    }
}
