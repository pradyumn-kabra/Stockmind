package com.stockmind.service;

import com.stockmind.detector.AnomalyReport;
import com.stockmind.detector.CompositeAnomalyDetector;
import com.stockmind.dto.AlertResponse;
import com.stockmind.entity.AnomalyAlertEntity;
import com.stockmind.entity.ProductEntity;
import com.stockmind.enums.AlertStatus;
import com.stockmind.exceptions.ValidationException;
import com.stockmind.mapper.AnomalyAlertMapper;
import com.stockmind.model.AnomalyAlert;
import com.stockmind.model.Product;
import com.stockmind.model.StockTransaction;
import com.stockmind.repository.AnomalyAlertRepository;
import com.stockmind.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stockmind.repository.StockTransactionRepository;

import java.util.List;
import java.util.UUID;

@Service
public class AnomalyDetectionService {

    private final AnomalyAlertRepository alertRepository;
    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;
    private final CompositeAnomalyDetector detector;

    public AnomalyDetectionService(
            AnomalyAlertRepository alertRepository,
            ProductRepository productRepository,
            StockTransactionRepository transactionRepository) {
        this.alertRepository = alertRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.detector = new CompositeAnomalyDetector();
    }

    /**
     * Inspects a newly recorded stock transaction. If anomalous, an AnomalyAlert is persisted.
     */
    @Transactional
    public AnomalyReport inspectAndRecord(StockTransaction transaction, Product product, List<StockTransaction> history) {
        AnomalyReport report = detector.analyze(transaction, product, history);

        if (report.isAnomaly()) {
            String alertId = "ALT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            AnomalyAlert alert = new AnomalyAlert(
                    alertId,
                    transaction.getId(),
                    report.getSeverity(),
                    report.getRuleCode(),
                    report.getScore(),
                    report.getExplanation()
            );

            AnomalyAlertEntity entity = AnomalyAlertMapper.toEntity(alert);
            alertRepository.save(entity);
        }

        return report;
    }

    public List<AlertResponse> getAllAlerts(AlertStatus status) {
        List<AnomalyAlertEntity> entities = (status != null)
                ? alertRepository.findByStatusOrderByCreatedAtDesc(status)
                : alertRepository.findAllByOrderByCreatedAtDesc();

        return entities.stream().map(entity -> {
            AnomalyAlert domain = AnomalyAlertMapper.toDomain(entity);
            String productId = "Unknown";
            String productName = "Unknown Product";

            if (domain.getTransactionId() != null) {
                var txOpt = transactionRepository.findById(domain.getTransactionId());
                if (txOpt.isPresent()) {
                    productId = txOpt.get().getProductId();
                    var prodOpt = productRepository.findById(productId);
                    if (prodOpt.isPresent()) {
                        productName = prodOpt.get().getName();
                    }
                }
            }

            return AlertResponse.fromDomain(domain, productId, productName);
        }).toList();
    }

    @Transactional
    public AnomalyAlert updateStatus(String alertId, AlertStatus status) {
        AnomalyAlertEntity entity = alertRepository.findById(alertId)
                .orElseThrow(() -> new ValidationException("Anomaly alert not found with ID: " + alertId));

        AnomalyAlert domain = AnomalyAlertMapper.toDomain(entity);
        if (status == AlertStatus.REVIEWED) {
            domain.markReviewed();
        } else if (status == AlertStatus.DISMISSED) {
            domain.markDismissed();
        } else {
            domain.setStatus(status);
        }

        AnomalyAlertEntity updated = AnomalyAlertMapper.toEntity(domain);
        alertRepository.save(updated);
        return domain;
    }

    public long getOpenAlertCount() {
        return alertRepository.countByStatus(AlertStatus.OPEN);
    }
}
