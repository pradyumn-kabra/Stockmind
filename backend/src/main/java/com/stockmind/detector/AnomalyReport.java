package com.stockmind.detector;

import com.stockmind.enums.AlertSeverity;

/**
 * Result returned by an AnomalyDetector upon inspecting a transaction.
 */
public class AnomalyReport {
    private final boolean anomaly;
    private final AlertSeverity severity;
    private final String ruleCode;
    private final Double score;
    private final String explanation;

    public AnomalyReport(boolean anomaly, AlertSeverity severity, String ruleCode, Double score, String explanation) {
        this.anomaly = anomaly;
        this.severity = severity;
        this.ruleCode = ruleCode;
        this.score = score;
        this.explanation = explanation;
    }

    public static AnomalyReport normal() {
        return new AnomalyReport(false, null, "NORMAL", 0.0, "Transaction within normal operational parameters.");
    }

    public boolean isAnomaly() {
        return anomaly;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public Double getScore() {
        return score;
    }

    public String getExplanation() {
        return explanation;
    }

    @Override
    public String toString() {
        return "AnomalyReport{" +
                "anomaly=" + anomaly +
                ", severity=" + severity +
                ", ruleCode='" + ruleCode + '\'' +
                ", score=" + score +
                ", explanation='" + explanation + '\'' +
                '}';
    }
}
