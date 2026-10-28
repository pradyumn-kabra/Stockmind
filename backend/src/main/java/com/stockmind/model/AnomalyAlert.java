package com.stockmind.model;

import com.stockmind.enums.AlertSeverity;
import com.stockmind.enums.AlertStatus;

import java.time.LocalDateTime;

/**
 * Domain entity representing an explainable anomaly detected by rule or statistical checks.
 */
public class AnomalyAlert {
    private String id;
    private String transactionId;
    private AlertSeverity severity;
    private String ruleCode;
    private Double score;
    private String explanation;
    private AlertStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public AnomalyAlert() {
        this.status = AlertStatus.OPEN;
        this.createdAt = LocalDateTime.now();
    }

    public AnomalyAlert(String id, String transactionId, AlertSeverity severity,
                        String ruleCode, Double score, String explanation) {
        this.id = id;
        this.transactionId = transactionId;
        this.severity = severity;
        this.ruleCode = ruleCode;
        this.score = score;
        this.explanation = explanation;
        this.status = AlertStatus.OPEN;
        this.createdAt = LocalDateTime.now();
    }

    public void markReviewed() {
        this.status = AlertStatus.REVIEWED;
        this.reviewedAt = LocalDateTime.now();
    }

    public void markDismissed() {
        this.status = AlertStatus.DISMISSED;
        this.reviewedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(AlertSeverity severity) {
        this.severity = severity;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public void setRuleCode(String ruleCode) {
        this.ruleCode = ruleCode;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    @Override
    public String toString() {
        return "AnomalyAlert{" +
                "id='" + id + '\'' +
                ", tx='" + transactionId + '\'' +
                ", severity=" + severity +
                ", code='" + ruleCode + '\'' +
                ", status=" + status +
                '}';
    }
}
