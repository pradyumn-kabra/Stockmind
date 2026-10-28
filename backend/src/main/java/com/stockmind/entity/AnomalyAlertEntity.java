package com.stockmind.entity;

import com.stockmind.enums.AlertSeverity;
import com.stockmind.enums.AlertStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "anomaly_alerts")
public class AnomalyAlertEntity {
    @Id
    @Column(name = "alert_id", length = 50, nullable = false)
    private String id;

    @Column(name = "transaction_id", length = 50, nullable = false)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 50, nullable = false)
    private AlertSeverity severity;

    @Column(name = "rule_code", length = 100, nullable = false)
    private String ruleCode;

    @Column(name = "score")
    private Double score;

    @Column(name = "explanation", columnDefinition = "TEXT", nullable = false)
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private AlertStatus status = AlertStatus.OPEN;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public AnomalyAlertEntity() {
        this.status = AlertStatus.OPEN;
        this.createdAt = LocalDateTime.now();
    }

    public AnomalyAlertEntity(String id, String transactionId, AlertSeverity severity,
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
}
