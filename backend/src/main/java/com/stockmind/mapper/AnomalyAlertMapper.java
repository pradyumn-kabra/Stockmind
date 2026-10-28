package com.stockmind.mapper;

import com.stockmind.entity.AnomalyAlertEntity;
import com.stockmind.model.AnomalyAlert;

public class AnomalyAlertMapper {

    public static AnomalyAlert toDomain(AnomalyAlertEntity entity) {
        if (entity == null) return null;
        AnomalyAlert domain = new AnomalyAlert();
        domain.setId(entity.getId());
        domain.setTransactionId(entity.getTransactionId());
        domain.setSeverity(entity.getSeverity());
        domain.setRuleCode(entity.getRuleCode());
        domain.setScore(entity.getScore());
        domain.setExplanation(entity.getExplanation());
        domain.setStatus(entity.getStatus());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setReviewedAt(entity.getReviewedAt());
        return domain;
    }

    public static AnomalyAlertEntity toEntity(AnomalyAlert domain) {
        if (domain == null) return null;
        AnomalyAlertEntity entity = new AnomalyAlertEntity();
        entity.setId(domain.getId());
        entity.setTransactionId(domain.getTransactionId());
        entity.setSeverity(domain.getSeverity());
        entity.setRuleCode(domain.getRuleCode());
        entity.setScore(domain.getScore());
        entity.setExplanation(domain.getExplanation());
        entity.setStatus(domain.getStatus());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setReviewedAt(domain.getReviewedAt());
        return entity;
    }
}
