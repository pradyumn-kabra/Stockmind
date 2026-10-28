package com.stockmind.model;

import com.stockmind.enums.ProductType;
import com.stockmind.exceptions.ValidationException;

/**
 * [VIVA SEARCH: INHERITANCE]
 * Concrete subclass representing electronics, IT hardware, and appliances.
 * Extends abstract parent Product and adds warranty tracking state (warrantyMonths).
 * Demonstrates Inheritance and Method Overriding.
 */
public class ElectronicProduct extends Product {
    private int warrantyMonths;

    public ElectronicProduct() {
        super();
        setProductType(ProductType.ELECTRONIC);
    }

    public ElectronicProduct(String id, String name, String category, double price,
                             int quantity, int reorderLevel, String supplierId, int warrantyMonths) {
        super(id, name, category, ProductType.ELECTRONIC, price, quantity, reorderLevel, supplierId);
        setWarrantyMonths(warrantyMonths);
    }

    // [VIVA SEARCH: METHOD OVERRIDING] & [VIVA SEARCH: INVARIANT VALIDATION]
    // Enforces that warranty duration cannot be a negative value.
    @Override
    public void validate() throws ValidationException {
        validateCommonFields();
        if (warrantyMonths < 0) {
            throw new ValidationException("Warranty months cannot be negative: " + warrantyMonths);
        }
    }

    /**
     * [VIVA SEARCH: WARRANTY LOGIC]
     * Checks if a device purchased 'monthsAgo' months ago is still covered under warranty.
     */
    public boolean isUnderWarranty(int monthsAgo) {
        return monthsAgo >= 0 && monthsAgo <= warrantyMonths;
    }

    @Override
    public boolean isReplenishmentNeeded() {
        return getQuantity() <= getReorderLevel();
    }

    public int getWarrantyMonths() {
        return warrantyMonths;
    }

    public void setWarrantyMonths(int warrantyMonths) {
        if (warrantyMonths < 0) {
            throw new ValidationException("Warranty months cannot be negative: " + warrantyMonths);
        }
        this.warrantyMonths = warrantyMonths;
    }

    @Override
    public String toString() {
        return super.toString() + ", warrantyMonths=" + warrantyMonths;
    }
}
