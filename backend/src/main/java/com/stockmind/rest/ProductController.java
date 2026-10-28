package com.stockmind.rest;

import com.stockmind.dto.ProductRequest;
import com.stockmind.dto.ProductResponse;
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
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final InventoryService inventoryService;

    public ProductController(ProductService productService, InventoryService inventoryService) {
        this.productService = productService;
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "active", required = false) Boolean active) {

        List<Product> products = productService.getAllProducts(query, category, active);
        List<ProductResponse> responses = products.stream().map(ProductResponse::fromDomain).toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable("id") String id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(ProductResponse.fromDomain(product));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        Product created = productService.createProduct(request);
        return new ResponseEntity<>(ProductResponse.fromDomain(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable("id") String id, @Valid @RequestBody ProductRequest request) {
        Product updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ProductResponse.fromDomain(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateProduct(@PathVariable("id") String id) {
        productService.deactivateProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        List<Product> lowStock = productService.getLowStockProducts();
        List<ProductResponse> responses = lowStock.stream().map(ProductResponse::fromDomain).toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionResponse>> getProductTransactions(@PathVariable("id") String id) {
        Product product = productService.getProductById(id);
        List<StockTransaction> history = inventoryService.getTransactionHistory(id);
        List<TransactionResponse> responses = history.stream()
                .map(tx -> TransactionResponse.fromDomain(tx, product.getName(), false, null))
                .toList();
        return ResponseEntity.ok(responses);
    }
}
