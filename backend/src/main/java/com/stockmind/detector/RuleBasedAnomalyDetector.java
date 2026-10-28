package com.stockmind.detector;

import com.stockmind.enums.AlertSeverity;
import com.stockmind.enums.TransactionType;
import com.stockmind.model.Product;
import com.stockmind.model.StockTransaction;

import java.time.LocalDateTime;
import java.util.List;

/**
 * [VIVA SEARCH: ANOMALY DETECTION] & [VIVA SEARCH: RULE-BASED HEURISTICS] & [VIVA SEARCH: LAYER A]
 * Layer A: Rule-Based Anomaly Detector.
 * Flags business policy anomalies: sudden large reductions, frequent adjustments, excessive damage.
 */
public class RuleBasedAnomalyDetector implements AnomalyDetector {

    @Override
    public String getDetectorName() {
        return "Rule-Based Detector (Layer A)";
    }

    @Override
    public AnomalyReport analyze(StockTransaction transaction, Product product, List<StockTransaction> history) {
        if (transaction == null) return AnomalyReport.normal();

        int prev = transaction.getPreviousQuantity();
        int qty = transaction.getQuantity();
        TransactionType type = transaction.getTransactionType();

        // [VIVA SEARCH: RULE 1 DRASTIC DEPLETION]
        // Rule 1: Drastic Stock Reduction (> 50% or > 80% of available stock in a single transaction)
        if (type == TransactionType.STOCK_OUT && prev >= 10) {
            double percentDrop = (double) qty / prev;
            if (percentDrop >= 0.80) {
                return new AnomalyReport(
                        true,
                        AlertSeverity.CRITICAL,
                        "RULE_DRASTIC_DEPLETION",
                        percentDrop,
                        String.format("Critical stock reduction: %d units issued, depleting %.1f%% of available inventory (%d).",
                                qty, percentDrop * 100, prev)
                );
            } else if (percentDrop >= 0.50) {
                return new AnomalyReport(
                        true,
                        AlertSeverity.HIGH,
                        "RULE_LARGE_DEPLETION",
                        percentDrop,
                        String.format("Unusually large stock reduction: %d units issued, depleting %.1f%% of stock (%d).",
                                qty, percentDrop * 100, prev)
                );
            }
        }

        // [VIVA SEARCH: RULE 2 DAMAGE ANOMALY]
        // Rule 2: Excessive Damage write-off (> 30% of stock or >= 20 units)
        if (type == TransactionType.DAMAGE) {
            double damageRatio = prev > 0 ? (double) qty / prev : 1.0;
            if (damageRatio >= 0.30 || qty >= 20) {
                return new AnomalyReport(
                        true,
                        AlertSeverity.HIGH,
                        "RULE_EXCESSIVE_DAMAGE",
                        damageRatio,
                        String.format("High damage write-off: %d units written off (%.1f%% of stock). Rationale: '%s'.",
                                qty, damageRatio * 100, transaction.getReason())
                );
            }
        }

        // [VIVA SEARCH: RULE 3 REPEATED ADJUSTMENT]
        // Rule 3: Rapid repeated adjustments in a short window (e.g. 24 hours)
        if (type == TransactionType.ADJUSTMENT && history != null && !history.isEmpty()) {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
            long recentAdjustments = history.stream()
                    .filter(tx -> tx.getTransactionType() == TransactionType.ADJUSTMENT)
                    .filter(tx -> tx.getCreatedAt() != null && tx.getCreatedAt().isAfter(cutoff))
                    .count();

            if (recentAdjustments >= 2) {
                return new AnomalyReport(
                        true,
                        AlertSeverity.MEDIUM,
                        "RULE_REPEATED_ADJUSTMENT",
                        (double) recentAdjustments + 1,
                        String.format("Repeated stock adjustment: %d adjustments recorded for product '%s' within the last 24 hours.",
                                recentAdjustments + 1, transaction.getProductId())
                );
            }
        }

        // [VIVA SEARCH: RULE 4 BALANCE CONSISTENCY]
        // Rule 4: Balance consistency invariant check (mathematical invariant prev + qty == resulting)
        if (type == TransactionType.STOCK_IN && transaction.getResultingQuantity() != prev + qty) {
            return new AnomalyReport(
                    true,
                    AlertSeverity.CRITICAL,
                    "RULE_BALANCE_INCONSISTENT",
                    1.0,
                    String.format("Inconsistent resulting balance: %d + %d != %d", prev, qty, transaction.getResultingQuantity())
            );
        }

        return AnomalyReport.normal();
    }
}
