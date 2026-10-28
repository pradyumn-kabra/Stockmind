package com.stockmind.detector;

import com.stockmind.enums.AlertSeverity;
import com.stockmind.model.Product;
import com.stockmind.model.StockTransaction;

import java.util.List;

/**
 * [VIVA SEARCH: COMPOSITE PATTERN] & [VIVA SEARCH: DUAL-LAYER ANOMALY ENGINE]
 * Composite detector orchestrating Layer A (rules) and Layer B (statistical analysis).
 * Implements the Composite Pattern: treats a combination of multiple anomaly detectors
 * as a single unified AnomalyDetector instance.
 */
public class CompositeAnomalyDetector implements AnomalyDetector {

    private final RuleBasedAnomalyDetector ruleDetector;
    private final StatisticalAnomalyDetector statisticalDetector;

    public CompositeAnomalyDetector() {
        this.ruleDetector = new RuleBasedAnomalyDetector();
        this.statisticalDetector = new StatisticalAnomalyDetector();
    }

    @Override
    public String getDetectorName() {
        return "Composite Dual-Layer Detector (Rule + Statistical)";
    }

    // [VIVA SEARCH: COMPOSITE EXECUTION]
    // Evaluates deterministic rules first; falls back to statistical Z-score baseline.
    @Override
    public AnomalyReport analyze(StockTransaction transaction, Product product, List<StockTransaction> history) {
        // 1. Layer A: Check domain rules
        AnomalyReport ruleReport = ruleDetector.analyze(transaction, product, history);
        if (ruleReport.isAnomaly() && (ruleReport.getSeverity() == AlertSeverity.CRITICAL || ruleReport.getSeverity() == AlertSeverity.HIGH)) {
            return ruleReport;
        }

        // 2. Layer B: Check statistical deviation
        AnomalyReport statReport = statisticalDetector.analyze(transaction, product, history);
        if (statReport.isAnomaly()) {
            return statReport;
        }

        // If rule reported medium severity and stat was normal, return rule report
        if (ruleReport.isAnomaly()) {
            return ruleReport;
        }

        return AnomalyReport.normal();
    }
}
