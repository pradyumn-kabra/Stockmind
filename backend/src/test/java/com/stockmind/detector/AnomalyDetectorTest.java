package com.stockmind.detector;

import com.stockmind.enums.AlertSeverity;
import com.stockmind.enums.TransactionType;
import com.stockmind.model.StandardProduct;
import com.stockmind.model.StockTransaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Explainable Anomaly Detection Tests")
class AnomalyDetectorTest {

    private StandardProduct product;
    private RuleBasedAnomalyDetector ruleDetector;
    private StatisticalAnomalyDetector statDetector;
    private CompositeAnomalyDetector compositeDetector;

    @BeforeEach
    void setUp() {
        product = new StandardProduct("P-TEST-1", "Bluetooth Speaker", "Audio", 45.0, 100, 15, "SUPP-1");
        ruleDetector = new RuleBasedAnomalyDetector();
        statDetector = new StatisticalAnomalyDetector();
        compositeDetector = new CompositeAnomalyDetector();
    }

    @Test
    @DisplayName("Rule: Normal stock-out should not trigger anomaly")
    void testNormalStockOut() {
        StockTransaction normalTx = new StockTransaction(
                "TX-1", "P-TEST-1", TransactionType.STOCK_OUT, 10, 100, 90, "Regular order"
        );
        AnomalyReport report = ruleDetector.analyze(normalTx, product, List.of());
        assertFalse(report.isAnomaly(), "Regular order should not be flagged");
    }

    @Test
    @DisplayName("Rule: Drastic stock depletion (>50% of available stock) should trigger HIGH/CRITICAL alert")
    void testDrasticStockDepletion() {
        // Depleting 60 out of 100 (60%)
        StockTransaction largeTx = new StockTransaction(
                "TX-2", "P-TEST-1", TransactionType.STOCK_OUT, 60, 100, 40, "Bulk purchase"
        );
        AnomalyReport report = ruleDetector.analyze(largeTx, product, List.of());
        assertTrue(report.isAnomaly());
        assertEquals(AlertSeverity.HIGH, report.getSeverity());
        assertEquals("RULE_LARGE_DEPLETION", report.getRuleCode());
        assertTrue(report.getExplanation().contains("60.0%"));

        // Depleting 90 out of 100 (90%)
        StockTransaction massiveTx = new StockTransaction(
                "TX-3", "P-TEST-1", TransactionType.STOCK_OUT, 90, 100, 10, "Emergency order"
        );
        AnomalyReport massiveReport = ruleDetector.analyze(massiveTx, product, List.of());
        assertTrue(massiveReport.isAnomaly());
        assertEquals(AlertSeverity.CRITICAL, massiveReport.getSeverity());
        assertEquals("RULE_DRASTIC_DEPLETION", massiveReport.getRuleCode());
    }

    @Test
    @DisplayName("Rule: Excessive damage write-off should trigger HIGH alert")
    void testExcessiveDamage() {
        StockTransaction damageTx = new StockTransaction(
                "TX-4", "P-TEST-1", TransactionType.DAMAGE, 35, 100, 65, "Forklift collision"
        );
        AnomalyReport report = ruleDetector.analyze(damageTx, product, List.of());
        assertTrue(report.isAnomaly());
        assertEquals(AlertSeverity.HIGH, report.getSeverity());
        assertEquals("RULE_EXCESSIVE_DAMAGE", report.getRuleCode());
    }

    @Test
    @DisplayName("Statistical: Unusually large transaction relative to history should produce high Z-score")
    void testStatisticalAnomaly() {
        List<StockTransaction> history = new ArrayList<>();
        // History of typical small sales: 5, 4, 6, 5, 5 units
        for (int i = 0; i < 5; i++) {
            history.add(new StockTransaction(
                    "TX-HIST-" + i, "P-TEST-1", TransactionType.STOCK_OUT, 5, 100 - i * 5, 95 - i * 5, "Retail"
            ));
        }

        // New transaction with 45 units (9x the standard volume)
        StockTransaction anomalyTx = new StockTransaction(
                "TX-SPIKE", "P-TEST-1", TransactionType.STOCK_OUT, 45, 100, 55, "Unexplained spike"
        );

        AnomalyReport report = statDetector.analyze(anomalyTx, product, history);
        assertTrue(report.isAnomaly(), "Significant spike should trigger statistical anomaly");
        assertTrue(report.getScore() > 3.0, "Z-Score should exceed threshold");
        assertTrue(report.getExplanation().contains("Z-Score"), "Explanation should articulate Z-Score calculation");

        // Composite detector should also catch this
        AnomalyReport compositeReport = compositeDetector.analyze(anomalyTx, product, history);
        assertTrue(compositeReport.isAnomaly());
    }

    @Test
    @DisplayName("Statistical Edge Case: Insufficient historical transactions (< 3) returns normal without error")
    void testInsufficientHistoryReturnsNormal() {
        StockTransaction tx = new StockTransaction(
                "TX-EDGE-1", "P-TEST-1", TransactionType.STOCK_OUT, 100, 500, 400, "Large order"
        );

        // Case 1: Empty history
        AnomalyReport emptyReport = statDetector.analyze(tx, product, List.of());
        assertFalse(emptyReport.isAnomaly());
        assertEquals(0.0, emptyReport.getScore());

        // Case 2: Only 1 transaction in history
        List<StockTransaction> singleTxHistory = List.of(
                new StockTransaction("TX-H1", "P-TEST-1", TransactionType.STOCK_OUT, 10, 500, 490, "Prior sale")
        );
        AnomalyReport singleReport = statDetector.analyze(tx, product, singleTxHistory);
        assertFalse(singleReport.isAnomaly(), "Fewer than minimum required transactions must not flag");

        // Case 3: Only 2 transactions in history
        List<StockTransaction> twoTxHistory = List.of(
                new StockTransaction("TX-H1", "P-TEST-1", TransactionType.STOCK_OUT, 10, 500, 490, "Prior 1"),
                new StockTransaction("TX-H2", "P-TEST-1", TransactionType.STOCK_OUT, 12, 490, 478, "Prior 2")
        );
        AnomalyReport twoReport = statDetector.analyze(tx, product, twoTxHistory);
        assertFalse(twoReport.isAnomaly());
    }

    @Test
    @DisplayName("Statistical Edge Case: Zero historical standard deviation must safeguard against division-by-zero")
    void testZeroStandardDeviationSafeguard() {
        // Exactly identical historical transaction quantities (mean = 10, stdDev = 0)
        List<StockTransaction> identicalHistory = List.of(
                new StockTransaction("TX-H1", "P-TEST-1", TransactionType.STOCK_OUT, 10, 200, 190, "Sale"),
                new StockTransaction("TX-H2", "P-TEST-1", TransactionType.STOCK_OUT, 10, 190, 180, "Sale"),
                new StockTransaction("TX-H3", "P-TEST-1", TransactionType.STOCK_OUT, 10, 180, 170, "Sale"),
                new StockTransaction("TX-H4", "P-TEST-1", TransactionType.STOCK_OUT, 10, 170, 160, "Sale")
        );

        // Moderate transaction (11 units): |11 - 10| / 1.0 = 1.0 -> not anomaly
        StockTransaction normalTx = new StockTransaction(
                "TX-EDGE-2", "P-TEST-1", TransactionType.STOCK_OUT, 11, 160, 149, "Regular sale"
        );
        AnomalyReport reportNormal = statDetector.analyze(normalTx, product, identicalHistory);
        assertFalse(reportNormal.isAnomaly());
        assertFalse(Double.isNaN(reportNormal.getScore()));
        assertFalse(Double.isInfinite(reportNormal.getScore()));

        // Extreme transaction (25 units): |25 - 10| / 1.0 = 15.0 -> CRITICAL anomaly
        StockTransaction extremeTx = new StockTransaction(
                "TX-EDGE-3", "P-TEST-1", TransactionType.STOCK_OUT, 25, 160, 135, "Spike sale"
        );
        AnomalyReport reportExtreme = statDetector.analyze(extremeTx, product, identicalHistory);
        assertTrue(reportExtreme.isAnomaly());
        assertEquals(AlertSeverity.CRITICAL, reportExtreme.getSeverity());
        assertEquals(15.0, reportExtreme.getScore(), 0.001);
        assertFalse(Double.isNaN(reportExtreme.getScore()));
        assertFalse(Double.isInfinite(reportExtreme.getScore()));
    }

    @Test
    @DisplayName("Statistical: Score Gradation across MEDIUM, HIGH, and CRITICAL thresholds")
    void testSeverityGradation() {
        // Historical baseline: mean = 10.0, stdDev ≈ 2.0
        List<StockTransaction> history = List.of(
                new StockTransaction("TX-1", "P-TEST-1", TransactionType.STOCK_OUT, 8, 300, 292, "Sale"),
                new StockTransaction("TX-2", "P-TEST-1", TransactionType.STOCK_OUT, 10, 292, 282, "Sale"),
                new StockTransaction("TX-3", "P-TEST-1", TransactionType.STOCK_OUT, 12, 282, 270, "Sale")
        );
        // mean = 10.0, varianceSum = (4 + 0 + 4) = 8, variance = 8/3 ≈ 2.667, stdDev = sqrt(2.667) ≈ 1.633

        // Case A: Z-score between 2.8 and 3.5 -> MEDIUM
        // (15 - 10) / 1.633 ≈ 3.06 -> MEDIUM
        StockTransaction mediumTx = new StockTransaction(
                "TX-MED", "P-TEST-1", TransactionType.STOCK_OUT, 15, 270, 255, "Medium spike"
        );
        AnomalyReport medReport = statDetector.analyze(mediumTx, product, history);
        assertTrue(medReport.isAnomaly());
        assertEquals(AlertSeverity.MEDIUM, medReport.getSeverity());

        // Case B: Z-score between 3.5 and 4.5 -> HIGH
        // (16 - 10) / 1.633 ≈ 3.67 -> HIGH
        StockTransaction highTx = new StockTransaction(
                "TX-HIGH", "P-TEST-1", TransactionType.STOCK_OUT, 16, 270, 254, "High spike"
        );
        AnomalyReport highReport = statDetector.analyze(highTx, product, history);
        assertTrue(highReport.isAnomaly());
        assertEquals(AlertSeverity.HIGH, highReport.getSeverity());

        // Case C: Z-score >= 4.5 -> CRITICAL
        // (20 - 10) / 1.633 ≈ 6.12 -> CRITICAL
        StockTransaction critTx = new StockTransaction(
                "TX-CRIT", "P-TEST-1", TransactionType.STOCK_OUT, 20, 270, 250, "Critical spike"
        );
        AnomalyReport critReport = statDetector.analyze(critTx, product, history);
        assertTrue(critReport.isAnomaly());
        assertEquals(AlertSeverity.CRITICAL, critReport.getSeverity());
    }
}
