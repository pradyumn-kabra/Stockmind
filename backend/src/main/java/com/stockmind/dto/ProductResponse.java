package com.stockmind.dto;

import com.stockmind.enums.ProductType;
import com.stockmind.model.ElectronicProduct;
import com.stockmind.model.PerishableProduct;
import com.stockmind.model.Product;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProductResponse {
    private String id;
    private String name;
    private String category;
    private ProductType productType;
    private double price;
    private int quantity;
    private String unit;
    private int reorderLevel;
    private String supplierId;
    private boolean active;
    private boolean replenishmentNeeded;
    private int suggestedReorderQuantity;
    private double inventoryValuation;
    private LocalDate expiryDate;
    private Long daysUntilExpiry;
    private Boolean expired;
    private Integer warrantyMonths;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse fromDomain(Product product) {
        if (product == null) return null;

        ProductResponse resp = new ProductResponse();
        resp.id = product.getId();
        resp.name = product.getName();
        resp.category = product.getCategory();
        resp.productType = product.getProductType();
        resp.price = product.getPrice();
        resp.quantity = product.getQuantity();
        resp.unit = product.getUnit();
        resp.reorderLevel = product.getReorderLevel();
        resp.supplierId = product.getSupplierId();
        resp.active = product.isActive();
        resp.replenishmentNeeded = product.isReplenishmentNeeded();
        resp.suggestedReorderQuantity = product.calculateSuggestedReorder(product.getReorderLevel() * 3);
        resp.inventoryValuation = product.getInventoryValuation();
        resp.createdAt = product.getCreatedAt();
        resp.updatedAt = product.getUpdatedAt();

        if (product instanceof PerishableProduct p) {
            resp.expiryDate = p.getExpiryDate();
            resp.daysUntilExpiry = p.getDaysUntilExpiry();
            resp.expired = p.isExpired();
        } else if (product instanceof ElectronicProduct e) {
            resp.warrantyMonths = e.getWarrantyMonths();
        }

        return resp;
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public ProductType getProductType() { return productType; }
    public double getPrice() { return price; }
    public int getQuantity() { return quantity; }
    public String getUnit() { return (unit != null && !unit.trim().isEmpty()) ? unit : "units"; }
    public void setUnit(String unit) { this.unit = (unit != null && !unit.trim().isEmpty()) ? unit.trim() : "units"; }
    public int getReorderLevel() { return reorderLevel; }
    public String getSupplierId() { return supplierId; }
    public boolean isActive() { return active; }
    public boolean isReplenishmentNeeded() { return replenishmentNeeded; }
    public int getSuggestedReorderQuantity() { return suggestedReorderQuantity; }
    public double getInventoryValuation() { return inventoryValuation; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public Long getDaysUntilExpiry() { return daysUntilExpiry; }
    public Boolean getExpired() { return expired; }
    public Integer getWarrantyMonths() { return warrantyMonths; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
