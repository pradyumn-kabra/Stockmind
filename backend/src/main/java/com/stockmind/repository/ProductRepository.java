package com.stockmind.repository;

import com.stockmind.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, String> {

    List<ProductEntity> findByActive(boolean active);

    List<ProductEntity> findByCategoryIgnoreCase(String category);

    List<ProductEntity> findByCategoryIgnoreCaseAndActive(String category, boolean active);

    List<ProductEntity> findBySupplierId(String supplierId);

    @Query("SELECT p FROM ProductEntity p WHERE p.active = true AND (p.quantity <= p.reorderLevel OR (p.expiryDate IS NOT NULL AND p.expiryDate < CURRENT_DATE))")
    List<ProductEntity> findLowStockProducts();

    @Query("SELECT p FROM ProductEntity p WHERE " +
           "(CAST(:query AS string) IS NULL OR LOWER(p.id) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))) AND " +
           "(CAST(:category AS string) IS NULL OR LOWER(p.category) = LOWER(CAST(:category AS string))) AND " +
           "(:active IS NULL OR p.active = :active)")
    List<ProductEntity> searchProducts(@Param("query") String query,
                                       @Param("category") String category,
                                       @Param("active") Boolean active);
}
