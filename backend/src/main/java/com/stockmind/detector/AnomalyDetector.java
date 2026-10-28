package com.stockmind.detector;

import com.stockmind.model.Product;
import com.stockmind.model.StockTransaction;

import java.util.List;

/**
 * Strategy interface for anomaly detection.
 * Demonstrates Strategy Pattern and Interface Abstraction.
 */
public interface AnomalyDetector {

    String getDetectorName();

    AnomalyReport analyze(StockTransaction transaction, Product product, List<StockTransaction> history);
}
