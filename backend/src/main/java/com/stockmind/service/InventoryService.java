package com.stockmind.service;

import com.stockmind.detector.AnomalyReport;
import com.stockmind.dto.TransactionRequest;
import com.stockmind.dto.TransactionResponse;
import com.stockmind.entity.ProductEntity;
import com.stockmind.entity.StockTransactionEntity;
import com.stockmind.enums.TransactionType;
import com.stockmind.exceptions.InvalidTransactionException;
import com.stockmind.exceptions.ProductNotFoundException;
import com.stockmind.mapper.ProductMapper;
import com.stockmind.mapper.StockTransactionMapper;
import com.stockmind.model.Product;
import com.stockmind.model.StockTransaction;
import com.stockmind.operations.*;
import com.stockmind.repository.ProductRepository;
import com.stockmind.repository.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Core business orchestrator for inventory transactions.
 * Enforces non-negotiable PRD rule: Java OOP implements actual stock mutations and validation.
 */
@Service
public class InventoryService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;
    private final AnomalyDetectionService anomalyDetectionService;

    public InventoryService(ProductRepository productRepository,
                            StockTransactionRepository transactionRepository,
                            AnomalyDetectionService anomalyDetectionService) {
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.anomalyDetectionService = anomalyDetectionService;
    }

    /**
     * [VIVA SEARCH: ACID TRANSACTION ROLLBACK] & [VIVA SEARCH: TRANSACTIONAL]
     * Atomically executes an inventory movement using polymorphic InventoryOperation objects.
     * If an InsufficientStockException or ValidationException is thrown, Spring rolls back
     * the entire database transaction, preventing partial writes or corrupted ledger balances.
     */
    @Transactional
    public TransactionResponse processTransaction(TransactionRequest request) {
        if (request == null || request.getProductId() == null) {
            throw new InvalidTransactionException("Transaction request and Product ID are required.");
        }

        // 1. Fetch persistent entity and convert to pure OOP Domain Model
        ProductEntity entity = productRepository.findById(request.getProductId().trim())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId().trim()));

        Product product = ProductMapper.toDomain(entity);
        int previousQuantity = product.getQuantity();

        // [VIVA SEARCH: STRATEGY PATTERN] & [VIVA SEARCH: POLYMORPHISM]
        // Instantiates the appropriate strategy object based on the transaction type enum:
        InventoryOperation operation = switch (request.getTransactionType()) {
            case STOCK_IN -> new StockInOperation(request.getQuantity(), request.getReason());
            case STOCK_OUT -> new StockOutOperation(request.getQuantity(), request.getReason());
            case DAMAGE -> new DamageOperation(request.getQuantity(), request.getReason());
            case ADJUSTMENT -> new StockAdjustmentOperation(request.getQuantity(), request.getReason());
            case null -> throw new InvalidTransactionException("Transaction type cannot be null.");
        };

        // [VIVA SEARCH: DYNAMIC DISPATCH] & [VIVA SEARCH: POLYMORPHISM]
        // Executes business logic strictly inside Java OOP domain layer:
        // JVM dynamically dispatches to the correct execute() method at runtime.
        // (Throws InsufficientStockException upon invariant violation).
        operation.execute(product);

        int resultingQuantity = product.getQuantity();

        // 4. Persist updated stock state
        ProductEntity updatedEntity = ProductMapper.toEntity(product);
        productRepository.save(updatedEntity);

        // [VIVA SEARCH: IMMUTABLE AUDIT LEDGER]
        // Create and persist immutable historical transaction record with generated UUID
        String transactionId = "TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        StockTransaction transaction = new StockTransaction(
                transactionId,
                product.getId(),
                request.getTransactionType(),
                request.getQuantity(),
                previousQuantity,
                resultingQuantity,
                operation.getReason()
        );

        StockTransactionEntity txEntity = StockTransactionMapper.toEntity(transaction);
        StockTransactionEntity savedTxEntity = transactionRepository.save(txEntity);
        StockTransaction savedTx = StockTransactionMapper.toDomain(savedTxEntity);

        // [VIVA SEARCH: ANOMALY DETECTION HOOK]
        // Inspect for anomalies using historical transaction baseline
        List<StockTransaction> history = transactionRepository
                .findByProductIdOrderByCreatedAtDesc(product.getId())
                .stream()
                .map(StockTransactionMapper::toDomain)
                .toList();

        AnomalyReport anomalyReport = anomalyDetectionService.inspectAndRecord(savedTx, product, history);

        // 7. Return complete response to presentation tier
        return TransactionResponse.fromDomain(
                savedTx,
                product.getName(),
                anomalyReport.isAnomaly(),
                anomalyReport.getExplanation()
        );
    }

    public List<StockTransaction> getTransactionHistory(String productId) {
        if (productId != null && !productId.trim().isEmpty()) {
            return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId.trim())
                    .stream()
                    .map(StockTransactionMapper::toDomain)
                    .toList();
        }
        return transactionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(StockTransactionMapper::toDomain)
                .toList();
    }

    public List<StockTransaction> getRecentTransactions() {
        return transactionRepository.findTop15ByOrderByCreatedAtDesc()
                .stream()
                .map(StockTransactionMapper::toDomain)
                .toList();
    }
}
