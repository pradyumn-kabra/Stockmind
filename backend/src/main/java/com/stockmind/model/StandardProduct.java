package com.stockmind.model;

import com.stockmind.enums.ProductType;
import com.stockmind.exceptions.ValidationException;

/**
 * Concrete subclass representing standard non-perishable, non-electronic inventory.
 */
public class StandardProduct extends Product {

    public StandardProduct() {
        super();
        setProductType(ProductType.STANDARD);
    }

    public StandardProduct(String id, String name, String category, double price,
                           int quantity, int reorderLevel, String supplierId) {
        super(id, name, category, ProductType.STANDARD, price, quantity, reorderLevel, supplierId);
    }

    @Override
    public void validate() throws ValidationException {
        validateCommonFields();
    }

    @Override
    public boolean isReplenishmentNeeded() {
        return getQuantity() <= getReorderLevel();
    }
}
