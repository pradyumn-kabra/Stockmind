package com.stockmind.model;

import com.stockmind.enums.ProductType;
import com.stockmind.exceptions.ValidationException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * [VIVA SEARCH: INHERITANCE]
 * Concrete subclass representing perishable inventory (e.g., dairy, bakery, pharmaceuticals).
 * Extends abstract parent Product and adds specialized state (expiryDate).
 * Demonstrates Inheritance, Method Overriding, and Polymorphism.
 */
public class PerishableProduct extends Product {
    private LocalDate expiryDate;

    public PerishableProduct() {
        super();
        setProductType(ProductType.PERISHABLE);
    }

    public PerishableProduct(String id, String name, String category, double price,
                             int quantity, int reorderLevel, String supplierId, LocalDate expiryDate) {
        super(id, name, category, ProductType.PERISHABLE, price, quantity, reorderLevel, supplierId);
        this.expiryDate = expiryDate;
    }

    // [VIVA SEARCH: METHOD OVERRIDING] & [VIVA SEARCH: POLYMORPHISM]
    // Specializes the abstract validate() contract: perishable goods MUST have an expiry date.
    @Override
    public void validate() throws ValidationException {
        validateCommonFields();
        if (expiryDate == null) {
            throw new ValidationException("Expiry date is required for perishable products.");
        }
    }

    /**
     * [VIVA SEARCH: EXPIRY DATE LOGIC]
     * Checks if the perishable product has already passed its expiration date using LocalDate.now().
     */
    public boolean isExpired() {
        if (expiryDate == null) return false;
        return LocalDate.now().isAfter(expiryDate);
    }

    /**
     * [VIVA SEARCH: EXPIRY DATE LOGIC]
     * Calculates remaining shelf life in days using ChronoUnit.DAYS.
     * Returns negative value if expired.
     */
    public long getDaysUntilExpiry() {
        if (expiryDate == null) return 0;
        return ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    /**
     * [VIVA SEARCH: POLYMORPHISM] & [VIVA SEARCH: METHOD OVERRIDING]
     * Overrides base replenishment logic polymorphically:
     * A perishable product requires replenishment if quantity is low OR if it has expired.
     */
    @Override
    public boolean isReplenishmentNeeded() {
        return getQuantity() <= getReorderLevel() || isExpired();
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    @Override
    public String toString() {
        return super.toString() + ", expiryDate=" + expiryDate + ", expired=" + isExpired();
    }
}
