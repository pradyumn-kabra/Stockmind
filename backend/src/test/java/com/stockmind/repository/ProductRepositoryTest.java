package com.stockmind.repository;

import com.stockmind.entity.ProductEntity;
import com.stockmind.enums.ProductType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("Spring Data JPA Persistence Integration Tests")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Test
    @DisplayName("Should persist and retrieve standard, perishable, and electronic products")
    void testProductPersistence() {
        ProductEntity milk = new ProductEntity();
        milk.setId("P-TEST-MILK");
        milk.setName("Organic 2% Milk");
        milk.setCategory("Dairy");
        milk.setProductType(ProductType.PERISHABLE);
        milk.setPrice(4.20);
        milk.setQuantity(8);
        milk.setReorderLevel(15);
        milk.setExpiryDate(LocalDate.now().plusDays(10));
        productRepository.save(milk);

        Optional<ProductEntity> retrieved = productRepository.findById("P-TEST-MILK");
        assertTrue(retrieved.isPresent());
        assertEquals("Organic 2% Milk", retrieved.get().getName());
        assertEquals(ProductType.PERISHABLE, retrieved.get().getProductType());
        assertEquals(LocalDate.now().plusDays(10), retrieved.get().getExpiryDate());

        // Low stock query verification
        List<ProductEntity> lowStock = productRepository.findLowStockProducts();
        assertEquals(1, lowStock.size());
        assertEquals("P-TEST-MILK", lowStock.get(0).getId());
    }

    @Test
    @DisplayName("Should filter active vs inactive products accurately")
    void testActiveFilter() {
        ProductEntity activeProd = new ProductEntity();
        activeProd.setId("P-ACTIVE-1");
        activeProd.setName("Active Widget");
        activeProd.setCategory("Hardware");
        activeProd.setProductType(ProductType.STANDARD);
        activeProd.setPrice(10.0);
        activeProd.setQuantity(50);
        activeProd.setReorderLevel(5);
        activeProd.setActive(true);
        productRepository.save(activeProd);

        ProductEntity inactiveProd = new ProductEntity();
        inactiveProd.setId("P-INACTIVE-1");
        inactiveProd.setName("Legacy Widget");
        inactiveProd.setCategory("Hardware");
        inactiveProd.setProductType(ProductType.STANDARD);
        inactiveProd.setPrice(15.0);
        inactiveProd.setQuantity(0);
        inactiveProd.setReorderLevel(5);
        inactiveProd.setActive(false);
        productRepository.save(inactiveProd);

        List<ProductEntity> activeList = productRepository.findByActive(true);
        assertEquals(1, activeList.size());
        assertEquals("P-ACTIVE-1", activeList.get(0).getId());
    }

    @Test
    @DisplayName("Should execute searchProducts with null parameters without SQL lower(bytea) exceptions")
    void testSearchProductsWithNulls() {
        ProductEntity prod = new ProductEntity();
        prod.setId("P-SEARCH-1");
        prod.setName("Amul Taaza Milk 1L");
        prod.setCategory("Dairy");
        prod.setProductType(ProductType.PERISHABLE);
        prod.setPrice(68.0);
        prod.setQuantity(50);
        prod.setUnit("L");
        prod.setReorderLevel(10);
        prod.setActive(true);
        productRepository.save(prod);

        // 1. All nulls (simulates default catalogue fetch)
        List<ProductEntity> all = productRepository.searchProducts(null, null, null);
        assertFalse(all.isEmpty());

        // 2. Active filter with null query and category
        List<ProductEntity> activeOnly = productRepository.searchProducts(null, null, true);
        assertFalse(activeOnly.isEmpty());

        // 3. Search query match
        List<ProductEntity> matched = productRepository.searchProducts("amul", null, null);
        assertEquals(1, matched.size());
        assertEquals("P-SEARCH-1", matched.get(0).getId());
    }

    @Test
    @DisplayName("Should persist and retrieve unit field on ProductEntity")
    void testProductUnitPersistence() {
        ProductEntity prod = new ProductEntity();
        prod.setId("P-UNIT-TEST");
        prod.setName("Basmati Rice 5kg");
        prod.setCategory("Groceries");
        prod.setProductType(ProductType.STANDARD);
        prod.setPrice(460.0);
        prod.setQuantity(30);
        prod.setUnit("bags");
        prod.setReorderLevel(10);
        prod.setActive(true);
        productRepository.save(prod);

        Optional<ProductEntity> retrieved = productRepository.findById("P-UNIT-TEST");
        assertTrue(retrieved.isPresent());
        assertEquals("bags", retrieved.get().getUnit());
    }
}
