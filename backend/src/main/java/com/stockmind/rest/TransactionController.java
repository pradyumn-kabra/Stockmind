package com.stockmind.rest;

import com.stockmind.dto.TransactionRequest;
import com.stockmind.dto.TransactionResponse;
import com.stockmind.model.Product;
import com.stockmind.model.StockTransaction;
import com.stockmind.service.InventoryService;
import com.stockmind.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final InventoryService inventoryService;
    private final ProductService productService;

    public TransactionController(InventoryService inventoryService, ProductService productService) {
        this.inventoryService = inventoryService;
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> processTransaction(@Valid @RequestBody TransactionRequest request) {
        TransactionResponse response = inventoryService.processTransaction(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(@RequestParam(value = "productId", required = false) String productId) {
        List<StockTransaction> transactions = inventoryService.getTransactionHistory(productId);
        List<TransactionResponse> responses = transactions.stream().map(tx -> {
            String prodName = "Unknown";
            try {
                Product p = productService.getProductById(tx.getProductId());
                prodName = p.getName();
            } catch (Exception ignored) {}
            return TransactionResponse.fromDomain(tx, prodName, false, null);
        }).toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TransactionResponse>> getRecentTransactions() {
        List<StockTransaction> recent = inventoryService.getRecentTransactions();
        List<TransactionResponse> responses = recent.stream().map(tx -> {
            String prodName = "Unknown";
            try {
                Product p = productService.getProductById(tx.getProductId());
                prodName = p.getName();
            } catch (Exception ignored) {}
            return TransactionResponse.fromDomain(tx, prodName, false, null);
        }).toList();

        return ResponseEntity.ok(responses);
    }
}
