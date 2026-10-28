package com.stockmind.mapper;

import com.stockmind.entity.StockTransactionEntity;
import com.stockmind.model.StockTransaction;

public class StockTransactionMapper {

    public static StockTransaction toDomain(StockTransactionEntity entity) {
        if (entity == null) return null;
        StockTransaction domain = new StockTransaction();
        domain.setId(entity.getId());
        domain.setProductId(entity.getProductId());
        domain.setTransactionType(entity.getTransactionType());
        domain.setQuantity(entity.getQuantity());
        domain.setPreviousQuantity(entity.getPreviousQuantity());
        domain.setResultingQuantity(entity.getResultingQuantity());
        domain.setReason(entity.getReason());
        domain.setCreatedAt(entity.getCreatedAt());
        return domain;
    }

    public static StockTransactionEntity toEntity(StockTransaction domain) {
        if (domain == null) return null;
        StockTransactionEntity entity = new StockTransactionEntity();
        entity.setId(domain.getId());
        entity.setProductId(domain.getProductId());
        entity.setTransactionType(domain.getTransactionType());
        entity.setQuantity(domain.getQuantity());
        entity.setPreviousQuantity(domain.getPreviousQuantity());
        entity.setResultingQuantity(domain.getResultingQuantity());
        entity.setReason(domain.getReason());
        entity.setCreatedAt(domain.getCreatedAt());
        return entity;
    }
}
