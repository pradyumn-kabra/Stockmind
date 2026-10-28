package com.stockmind.detector;

import com.stockmind.enums.AlertSeverity;
import com.stockmind.model.Product;
import com.stockmind.model.StockTransaction;

import java.util.List;

/**
 * [VIVA SEARCH: ANOMALY DETECTION] & [VIVA SEARCH: STATISTICAL Z-SCORE] & [VIVA SEARCH: LAYER B]
 * Layer B: Statistical Anomaly Detector.
 * Implements pure Java explainable anomaly detection using Z-score deviation over transaction history.
 * No external machine learning black-box: completely deterministic and auditable.
 */
public class StatisticalAnomalyDetector implements AnomalyDetector {

    private final double zScoreThreshold;
    private final int minHistoryRequired;

    public StatisticalAnomalyDetector() {
        this(2.8, 3);
    }

    public StatisticalAnomalyDetector(double zScoreThreshold, int minHistoryRequired) {
        this.zScoreThreshold = zScoreThreshold;
        this.minHistoryRequired = minHistoryRequired;
    }

    @Override
    public String getDetectorName() {
        return "Statistical Z-Score Detector (Layer B)";
    }

    @Override
    public AnomalyReport analyze(StockTransaction transaction, Product product, List<StockTransaction> history) {
        if (transaction == null || history == null || history.size() < minHistoryRequired) {
            return AnomalyReport.normal();
        }

        // Filter history by same transaction type or comparable movement
        List<Integer> quantities = history.stream()
                .filter(tx -> tx.getTransactionType() == transaction.getTransactionType())
                .map(tx -> Math.abs(tx.getQuantity()))
                .toList();

        if (quantities.size() < minHistoryRequired) {
            return AnomalyReport.normal();
        }

        // [VIVA SEARCH: MEAN CALCULATION]
        // Step 1: Calculate Mean (average movement quantity)
        double sum = 0.0;
        for (int q : quantities) {
            sum += q;
        }
        double mean = sum / quantities.size();

        // [VIVA SEARCH: STANDARD DEVIATION]
        // Step 2: Calculate Standard Deviation (sigma = sqrt(sum((x - mean)^2) / N))
        double varianceSum = 0.0;
        for (int q : quantities) {
            varianceSum += Math.pow(q - mean, 2);
        }
        double stdDev = Math.sqrt(varianceSum / quantities.size());
        if (stdDev < 1.0) {
            stdDev = 1.0; // Prevent division by zero or overly sensitive triggers
        }

        // [VIVA SEARCH: Z-SCORE FORMULA]
        // Step 3: Compute Z-Score = |currentQty - mean| / stdDev
        int currentQty = Math.abs(transaction.getQuantity());
        double zScore = Math.abs(currentQty - mean) / stdDev;

        // [VIVA SEARCH: THRESHOLD EVALUATION]
        // If Z-Score >= 2.8, movement is statistically anomalous
        if (zScore >= zScoreThreshold) {
            AlertSeverity severity;
            if (zScore >= 4.5) {
                severity = AlertSeverity.CRITICAL;
            } else if (zScore >= 3.5) {
                severity = AlertSeverity.HIGH;
            } else {
                severity = AlertSeverity.MEDIUM;
            }

            // Plain-English explainable math output for warehouse auditors
            String explanation = String.format(
                    "Statistical anomaly: Movement quantity (%d) deviates significantly from the product's historical %s average (%.1f ± %.1f). Z-Score: %.2f (Threshold: %.1f).",
                    currentQty, transaction.getTransactionType(), mean, stdDev, zScore, zScoreThreshold
            );

            return new AnomalyReport(true, severity, "STATISTICAL_ZSCORE", zScore, explanation);
        }

        return AnomalyReport.normal();
    }
}
