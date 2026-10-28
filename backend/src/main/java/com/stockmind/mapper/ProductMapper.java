package com.stockmind.mapper;

import com.stockmind.entity.ProductEntity;
import com.stockmind.enums.ProductType;
import com.stockmind.model.ElectronicProduct;
import com.stockmind.model.PerishableProduct;
import com.stockmind.model.Product;
import com.stockmind.model.StandardProduct;

public class ProductMapper {

    public static Product toDomain(ProductEntity entity) {
        if (entity == null) return null;

        Product product;
        ProductType type = entity.getProductType() != null ? entity.getProductType() : ProductType.STANDARD;

        switch (type) {
            case PERISHABLE -> {
                PerishableProduct p = new PerishableProduct();
                p.setExpiryDate(entity.getExpiryDate());
                product = p;
            }
            case ELECTRONIC -> {
                ElectronicProduct e = new ElectronicProduct();
                e.setWarrantyMonths(entity.getWarrantyMonths() != null ? entity.getWarrantyMonths() : 0);
                product = e;
            }
            default -> product = new StandardProduct();
        }

        product.setId(entity.getId());
        product.setName(entity.getName());
        product.setCategory(entity.getCategory());
        product.setProductType(type);
        product.setPrice(entity.getPrice());
        product.setQuantity(entity.getQuantity());
        product.setUnit(entity.getUnit());
        product.setReorderLevel(entity.getReorderLevel());
        product.setSupplierId(entity.getSupplierId());
        product.setActive(entity.isActive());
        product.setCreatedAt(entity.getCreatedAt());
        product.setUpdatedAt(entity.getUpdatedAt());

        return product;
    }

    public static ProductEntity toEntity(Product domain) {
        if (domain == null) return null;

        ProductEntity entity = new ProductEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setCategory(domain.getCategory());
        entity.setProductType(domain.getProductType());
        entity.setPrice(domain.getPrice());
        entity.setQuantity(domain.getQuantity());
        entity.setUnit(domain.getUnit());
        entity.setReorderLevel(domain.getReorderLevel());
        entity.setSupplierId(domain.getSupplierId());
        entity.setActive(domain.isActive());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());

        if (domain instanceof PerishableProduct p) {
            entity.setExpiryDate(p.getExpiryDate());
        } else if (domain instanceof ElectronicProduct e) {
            entity.setWarrantyMonths(e.getWarrantyMonths());
        }

        return entity;
    }
}
