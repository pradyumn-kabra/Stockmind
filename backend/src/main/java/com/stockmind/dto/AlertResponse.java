package com.stockmind.dto;

import com.stockmind.enums.AlertSeverity;
import com.stockmind.enums.AlertStatus;
import com.stockmind.model.AnomalyAlert;

import java.time.LocalDateTime;

public class AlertResponse {
    private String id;
    private String transactionId;
    private String productId;
    private String productName;
    private AlertSeverity severity;
    private String ruleCode;
    private Double score;
    private String explanation;
    private AlertStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public static AlertResponse fromDomain(AnomalyAlert alert, String productId, String productName) {
        if (alert == null) return null;
        AlertResponse resp = new AlertResponse();
        resp.id = alert.getId();
        resp.transactionId = alert.getTransactionId();
        resp.productId = productId;
        resp.productName = productName;
        resp.severity = alert.getSeverity();
        resp.ruleCode = alert.getRuleCode();
        resp.score = alert.getScore();
        resp.explanation = alert.getExplanation();
        resp.status = alert.getStatus();
        resp.createdAt = alert.getCreatedAt();
        resp.reviewedAt = alert.getReviewedAt();
        return resp;
    }

    public String getId() { return id; }
    public String getTransactionId() { return transactionId; }
    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public AlertSeverity getSeverity() { return severity; }
    public String getRuleCode() { return ruleCode; }
    public Double getScore() { return score; }
    public String getExplanation() { return explanation; }
    public AlertStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
}
