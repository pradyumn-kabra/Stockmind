package com.stockmind.service;

import com.stockmind.dto.ProductRequest;
import com.stockmind.entity.ProductEntity;
import com.stockmind.enums.ProductType;
import com.stockmind.exceptions.DuplicateProductException;
import com.stockmind.exceptions.ProductNotFoundException;
import com.stockmind.exceptions.SupplierNotFoundException;
import com.stockmind.mapper.ProductMapper;
import com.stockmind.model.ElectronicProduct;
import com.stockmind.model.PerishableProduct;
import com.stockmind.model.Product;
import com.stockmind.model.StandardProduct;
import com.stockmind.repository.ProductRepository;
import com.stockmind.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public ProductService(ProductRepository productRepository, SupplierRepository supplierRepository) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    public List<Product> getAllProducts(String query, String category, Boolean active) {
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty();

        List<ProductEntity> entities;
        if (!hasQuery && !hasCategory && active == null) {
            entities = productRepository.findAll();
        } else if (!hasQuery && !hasCategory && active != null) {
            entities = productRepository.findByActive(active);
        } else if (!hasQuery && hasCategory && active == null) {
            entities = productRepository.findByCategoryIgnoreCase(category.trim());
        } else if (!hasQuery && hasCategory && active != null) {
            entities = productRepository.findByCategoryIgnoreCaseAndActive(category.trim(), active);
        } else {
            String cleanQuery = hasQuery ? query.trim() : null;
            String cleanCat = hasCategory ? category.trim() : null;
            entities = productRepository.searchProducts(cleanQuery, cleanCat, active);
        }
        return entities.stream().map(ProductMapper::toDomain).toList();
    }

    public Product getProductById(String id) {
        ProductEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return ProductMapper.toDomain(entity);
    }

    @Transactional
    public Product createProduct(ProductRequest request) {
        if (productRepository.existsById(request.getId())) {
            throw new DuplicateProductException(request.getId());
        }

        if (request.getSupplierId() != null && !request.getSupplierId().trim().isEmpty()) {
            if (!supplierRepository.existsById(request.getSupplierId().trim())) {
                throw new SupplierNotFoundException(request.getSupplierId().trim());
            }
        }

        // Create specialized concrete product instance based on product type
        Product product;
        ProductType type = request.getProductType() != null ? request.getProductType() : ProductType.STANDARD;

        switch (type) {
            case PERISHABLE -> {
                PerishableProduct p = new PerishableProduct();
                p.setExpiryDate(request.getExpiryDate());
                product = p;
            }
            case ELECTRONIC -> {
                ElectronicProduct e = new ElectronicProduct();
                e.setWarrantyMonths(request.getWarrantyMonths() != null ? request.getWarrantyMonths() : 0);
                product = e;
            }
            default -> product = new StandardProduct();
        }

        product.setId(request.getId().trim());
        product.setName(request.getName().trim());
        product.setCategory(request.getCategory().trim());
        product.setProductType(type);
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setUnit(request.getUnit());
        product.setReorderLevel(request.getReorderLevel());
        product.setSupplierId(request.getSupplierId() != null ? request.getSupplierId().trim() : null);

        // Enforce OOP domain validation invariants
        product.validate();

        ProductEntity entity = ProductMapper.toEntity(product);
        ProductEntity saved = productRepository.save(entity);
        return ProductMapper.toDomain(saved);
    }

    @Transactional
    public Product updateProduct(String id, ProductRequest request) {
        ProductEntity existing = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        if (request.getSupplierId() != null && !request.getSupplierId().trim().isEmpty()) {
            if (!supplierRepository.existsById(request.getSupplierId().trim())) {
                throw new SupplierNotFoundException(request.getSupplierId().trim());
            }
        }

        Product domain = ProductMapper.toDomain(existing);
        domain.setName(request.getName().trim());
        domain.setCategory(request.getCategory().trim());
        domain.setPrice(request.getPrice());
        if (request.getUnit() != null && !request.getUnit().trim().isEmpty()) {
            domain.setUnit(request.getUnit().trim());
        }
        domain.setReorderLevel(request.getReorderLevel());
        domain.setSupplierId(request.getSupplierId() != null ? request.getSupplierId().trim() : null);

        if (domain instanceof PerishableProduct p && request.getExpiryDate() != null) {
            p.setExpiryDate(request.getExpiryDate());
        } else if (domain instanceof ElectronicProduct e && request.getWarrantyMonths() != null) {
            e.setWarrantyMonths(request.getWarrantyMonths());
        }

        // Validate before persisting
        domain.validate();

        ProductEntity updatedEntity = ProductMapper.toEntity(domain);
        ProductEntity saved = productRepository.save(updatedEntity);
        return ProductMapper.toDomain(saved);
    }

    @Transactional
    public void deactivateProduct(String id) {
        ProductEntity existing = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        // Soft delete: deactivating preserves historical transaction records
        existing.setActive(false);
        productRepository.save(existing);
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(ProductMapper::toDomain)
                .toList();
    }
}
