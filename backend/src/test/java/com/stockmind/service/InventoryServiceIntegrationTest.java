package com.stockmind.service;

import com.stockmind.dto.ProductRequest;
import com.stockmind.dto.TransactionRequest;
import com.stockmind.dto.TransactionResponse;
import com.stockmind.enums.AlertStatus;
import com.stockmind.enums.ProductType;
import com.stockmind.enums.TransactionType;
import com.stockmind.exceptions.InsufficientStockException;
import com.stockmind.model.Product;
import com.stockmind.repository.AnomalyAlertRepository;
import com.stockmind.repository.ProductRepository;
import com.stockmind.repository.StockTransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("End-to-End Inventory Service Integration Tests")
class InventoryServiceIntegrationTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private AnomalyAlertRepository alertRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockTransactionRepository transactionRepository;

    @Autowired
    private DemoDataService demoDataService;

    @Test
    @Transactional
    @DisplayName("Complete Stock-In and Stock-Out Flow with Insufficient Stock Rejection")
    void testInventoryFlow() {
        // 1. Create product
        ProductRequest req = new ProductRequest();
        req.setId("P-TEST-FLOW-1");
        req.setName("Test Smart Watch");
        req.setCategory("Electronics");
        req.setProductType(ProductType.ELECTRONIC);
        req.setPrice(150.0);
        req.setQuantity(50);
        req.setReorderLevel(10);
        req.setWarrantyMonths(12);

        Product created = productService.createProduct(req);
        assertEquals(50, created.getQuantity());

        // 2. Execute Stock In (Receive 20 units)
        TransactionRequest stockInReq = new TransactionRequest();
        stockInReq.setProductId("P-TEST-FLOW-1");
        stockInReq.setTransactionType(TransactionType.STOCK_IN);
        stockInReq.setQuantity(20);
        stockInReq.setReason("Supplier delivery");

        TransactionResponse inResp = inventoryService.processTransaction(stockInReq);
        assertEquals(50, inResp.getPreviousQuantity());
        assertEquals(70, inResp.getResultingQuantity());
        assertEquals(70, productService.getProductById("P-TEST-FLOW-1").getQuantity());

        // 3. Execute Stock Out (Dispatch 15 units)
        TransactionRequest stockOutReq = new TransactionRequest();
        stockOutReq.setProductId("P-TEST-FLOW-1");
        stockOutReq.setTransactionType(TransactionType.STOCK_OUT);
        stockOutReq.setQuantity(15);
        stockOutReq.setReason("Order #1001");

        TransactionResponse outResp = inventoryService.processTransaction(stockOutReq);
        assertEquals(70, outResp.getPreviousQuantity());
        assertEquals(55, outResp.getResultingQuantity());
        assertEquals(55, productService.getProductById("P-TEST-FLOW-1").getQuantity());

        // 4. Execute Excessive Stock Out (Request 100 units when only 55 available)
        TransactionRequest excessiveReq = new TransactionRequest();
        excessiveReq.setProductId("P-TEST-FLOW-1");
        excessiveReq.setTransactionType(TransactionType.STOCK_OUT);
        excessiveReq.setQuantity(100);
        excessiveReq.setReason("Excessive demand");

        assertThrows(InsufficientStockException.class, () -> inventoryService.processTransaction(excessiveReq));
        // Verify balance remained at 55
        assertEquals(55, productService.getProductById("P-TEST-FLOW-1").getQuantity());
    }

    @Test
    @Transactional
    @DisplayName("Drastic stock depletion should generate explainable AnomalyAlert")
    void testAnomalyGeneration() {
        ProductRequest req = new ProductRequest();
        req.setId("P-TEST-ANOM-1");
        req.setName("Expensive Microscope");
        req.setCategory("Science");
        req.setProductType(ProductType.STANDARD);
        req.setPrice(950.0);
        req.setQuantity(40);
        req.setReorderLevel(5);
        productService.createProduct(req);

        // Deplete 35 out of 40 (87.5% drop) -> Critical Rule trigger
        TransactionRequest tx = new TransactionRequest();
        tx.setProductId("P-TEST-ANOM-1");
        tx.setTransactionType(TransactionType.STOCK_OUT);
        tx.setQuantity(35);
        tx.setReason("Sudden inventory loss / urgent withdrawal");

        TransactionResponse resp = inventoryService.processTransaction(tx);
        assertTrue(resp.isFlaggedAsAnomaly(), "Transaction should be flagged as anomaly");
        assertNotNull(resp.getAnomalyExplanation());

        // Verify alert was saved to repository
        long openAlerts = alertRepository.countByStatus(AlertStatus.OPEN);
        assertTrue(openAlerts > 0, "Anomaly alert must be persisted in database");
    }

    @Test
    @Transactional
    @DisplayName("Demo data seeding should be repeatable without duplicate errors")
    void testDemoDataSeeding() {
        var res1 = demoDataService.seedDemoData();
        assertEquals("SUCCESS", res1.get("status"));
        assertTrue((int) res1.get("productsSeeded") >= 30);

        // Second run must be idempotent
        var res2 = demoDataService.seedDemoData();
        assertEquals("SUCCESS", res2.get("status"));
        assertEquals(0, res2.get("productsSeeded"), "Repeated seeding must not duplicate records");
    }
}
