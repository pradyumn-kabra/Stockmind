package com.stockmind.repository;

import com.stockmind.entity.StockTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransactionEntity, String> {

    List<StockTransactionEntity> findByProductIdOrderByCreatedAtDesc(String productId);

    List<StockTransactionEntity> findAllByOrderByCreatedAtDesc();

    List<StockTransactionEntity> findTop15ByOrderByCreatedAtDesc();
}
