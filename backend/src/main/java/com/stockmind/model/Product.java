package com.stockmind.model;

import com.stockmind.enums.ProductType;
import com.stockmind.exceptions.ValidationException;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * [VIVA SEARCH: ABSTRACTION]
 * Abstract base class representing a product in the inventory.
 * Demonstrates Abstraction and Encapsulation with strict invariant enforcement.
 * Concrete implementations: PerishableProduct, ElectronicProduct, StandardProduct.
 */
public abstract class Product {

    // [VIVA SEARCH: ENCAPSULATION]
    // All internal state fields are marked private to protect data integrity.
    // State cannot be mutated directly from outside; only through guarded mutators or operations.
    private String id;
    private String name;
    private String category;
    private ProductType productType;
    private double price;
    private int quantity;
    private String unit = "units";
    private int reorderLevel;
    private String supplierId;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product() {
        this.unit = "units";
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Product(String id, String name, String category, ProductType productType,
                   double price, int quantity, int reorderLevel, String supplierId) {
        this(id, name, category, productType, price, quantity, "units", reorderLevel, supplierId);
    }

    public Product(String id, String name, String category, ProductType productType,
                   double price, int quantity, String unit, int reorderLevel, String supplierId) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.productType = productType;
        setPrice(price);
        setQuantity(quantity);
        setUnit(unit);
        setReorderLevel(reorderLevel);
        this.supplierId = supplierId;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * [VIVA SEARCH: ABSTRACTION] & [VIVA SEARCH: POLYMORPHISM]
     * Polymorphic validation contract implemented by each specific product type:
     * - PerishableProduct verifies that expiryDate is not null.
     * - ElectronicProduct verifies warrantyMonths >= 0.
     * - StandardProduct verifies basic common attributes.
     */
    public abstract void validate() throws ValidationException;

    /**
     * [VIVA SEARCH: ABSTRACTION] & [VIVA SEARCH: POLYMORPHISM]
     * Determines whether this product currently requires replenishment.
     * Overridden polymorphically by specialized subclasses (e.g., PerishableProduct accounts for expiry).
     */
    public abstract boolean isReplenishmentNeeded();

    /**
     * Calculates the suggested reorder quantity to reach target stock.
     * Formula: max(0, targetStock - currentQuantity)
     */
    public int calculateSuggestedReorder(int targetStock) {
        return Math.max(0, targetStock - this.quantity);
    }

    /**
     * [VIVA SEARCH: INVENTORY VALUATION MATH]
     * Calculates total asset valuation for this SKU.
     * Formula: price * quantity (pure Java domain computation).
     */
    public double getInventoryValuation() {
        return this.price * this.quantity;
    }

    /**
     * Common validation logic applicable to all products.
     */
    protected void validateCommonFields() throws ValidationException {
        if (id == null || id.trim().isEmpty()) {
            throw new ValidationException("Product ID cannot be empty.");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Product name cannot be empty.");
        }
        if (category == null || category.trim().isEmpty()) {
            throw new ValidationException("Product category cannot be empty.");
        }
        if (price < 0) {
            throw new ValidationException("Product price cannot be negative.");
        }
        if (quantity < 0) {
            throw new ValidationException("Product quantity cannot be negative.");
        }
        if (reorderLevel < 0) {
            throw new ValidationException("Reorder level cannot be negative.");
        }
    }

    // Getters and Setters with Encapsulation
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public ProductType getProductType() {
        return productType;
    }

    public void setProductType(ProductType productType) {
        this.productType = productType;
    }

    public double getPrice() {
        return price;
    }

    // [VIVA SEARCH: ENCAPSULATION] & [VIVA SEARCH: INVARIANT VALIDATION]
    // Mutators guard business rules: price cannot be negative.
    public void setPrice(double price) {
        if (price < 0) {
            throw new ValidationException("Price cannot be negative: " + price);
        }
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    // [VIVA SEARCH: ENCAPSULATION] & [VIVA SEARCH: NEGATIVE STOCK PREVENTION]
    // Prevents corrupted state at the domain level: stock quantity can never drop below zero.
    public void setQuantity(int quantity) {
        if (quantity < 0) {
            throw new ValidationException("Quantity cannot be negative: " + quantity);
        }
        this.quantity = quantity;
        this.updatedAt = LocalDateTime.now();
    }

    public String getUnit() {
        return (unit != null && !unit.trim().isEmpty()) ? unit : "units";
    }

    public void setUnit(String unit) {
        this.unit = (unit != null && !unit.trim().isEmpty()) ? unit.trim() : "units";
        this.updatedAt = LocalDateTime.now();
    }

    public int getReorderLevel() {
        return reorderLevel;
    }

    // [VIVA SEARCH: ENCAPSULATION] & [VIVA SEARCH: INVARIANT VALIDATION]
    // Reorder threshold must be non-negative.
    public void setReorderLevel(int reorderLevel) {
        if (reorderLevel < 0) {
            throw new ValidationException("Reorder level cannot be negative: " + reorderLevel);
        }
        this.reorderLevel = reorderLevel;
    }

    public String getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(String supplierId) {
        this.supplierId = supplierId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Product product)) return false;
        return Objects.equals(id, product.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", category='" + category + '\'' +
                ", type=" + productType +
                ", price=" + price +
                ", quantity=" + quantity +
                ", reorderLevel=" + reorderLevel +
                ", active=" + active +
                '}';
    }
}
