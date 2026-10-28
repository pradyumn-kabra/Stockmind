package com.stockmind.repository;

import com.stockmind.entity.SupplierEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<SupplierEntity, String> {

    @Query("SELECT s FROM SupplierEntity s WHERE " +
           "LOWER(s.id) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR " +
           "LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))")
    List<SupplierEntity> searchSuppliers(@Param("query") String query);
}
