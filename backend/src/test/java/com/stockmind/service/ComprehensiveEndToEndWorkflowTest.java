package com.stockmind.service;

import com.stockmind.dto.*;
import com.stockmind.enums.*;
import com.stockmind.exceptions.InsufficientStockException;
import com.stockmind.exceptions.ValidationException;
import com.stockmind.model.ElectronicProduct;
import com.stockmind.model.PerishableProduct;
import com.stockmind.model.Product;
import com.stockmind.repository.AnomalyAlertRepository;
import com.stockmind.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("Comprehensive End-to-End Workflow Verification")
class ComprehensiveEndToEndWorkflowTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private AnomalyDetectionService anomalyDetectionService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private CsvService csvService;

    @Autowired
    private DemoDataService demoDataService;

    @Autowired
    private AnomalyAlertRepository alertRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @Transactional
    @DisplayName("Workflow 1: Product Creation with Polymorphic Subclasses (Perishable & Electronic)")
    void testProductCreationWorkflows() {
        // Supplier creation first
        SupplierRequest supReq = new SupplierRequest();
        supReq.setId("SUPP-E2E-1");
        supReq.setName("E2E Global Supplier");
        supReq.setEmail("e2e@supplier.com");
        supplierService.createSupplier(supReq);

        // Perishable Product
        ProductRequest perReq = new ProductRequest();
        perReq.setId("P-E2E-PER-1");
        perReq.setName("Organic Greek Milk");
        perReq.setCategory("Dairy");
        perReq.setProductType(ProductType.PERISHABLE);
        perReq.setPrice(4.50);
        perReq.setQuantity(25);
        perReq.setReorderLevel(10);
        perReq.setSupplierId("SUPP-E2E-1");
        perReq.setExpiryDate(LocalDate.now().plusDays(10));

        Product perCreated = productService.createProduct(perReq);
        assertInstanceOf(PerishableProduct.class, perCreated);
        assertEquals(25, perCreated.getQuantity());

        // Electronic Product
        ProductRequest elecReq = new ProductRequest();
        elecReq.setId("P-E2E-ELEC-1");
        elecReq.setName("Noise Canceling Earbuds");
        elecReq.setCategory("Electronics");
        elecReq.setProductType(ProductType.ELECTRONIC);
        elecReq.setPrice(99.00);
        elecReq.setQuantity(30);
        elecReq.setReorderLevel(5);
        elecReq.setSupplierId("SUPP-E2E-1");
        elecReq.setWarrantyMonths(24);

        Product elecCreated = productService.createProduct(elecReq);
        assertInstanceOf(ElectronicProduct.class, elecCreated);
        assertEquals(24, ((ElectronicProduct) elecCreated).getWarrantyMonths());
    }

    @Test
    @Transactional
    @DisplayName("Workflow 2: Stock-In, Stock-Out and Invalid Stock-Out with Rollback Verification")
    void testStockOperationsAndRollback() {
        ProductRequest req = new ProductRequest();
        req.setId("P-E2E-STOCK-1");
        req.setName("Standard Office Paper");
        req.setCategory("Office");
        req.setProductType(ProductType.STANDARD);
        req.setPrice(20.00);
        req.setQuantity(40);
        req.setReorderLevel(15);
        productService.createProduct(req);

        // 1. Stock In: +30 units -> 70
        TransactionRequest inReq = new TransactionRequest();
        inReq.setProductId("P-E2E-STOCK-1");
        inReq.setTransactionType(TransactionType.STOCK_IN);
        inReq.setQuantity(30);
        inReq.setReason("Shipment arrival");

        TransactionResponse inResp = inventoryService.processTransaction(inReq);
        assertEquals(40, inResp.getPreviousQuantity());
        assertEquals(70, inResp.getResultingQuantity());
        assertEquals(70, productService.getProductById("P-E2E-STOCK-1").getQuantity());

        // 2. Stock Out: -25 units -> 45
        TransactionRequest outReq = new TransactionRequest();
        outReq.setProductId("P-E2E-STOCK-1");
        outReq.setTransactionType(TransactionType.STOCK_OUT);
        outReq.setQuantity(25);
        outReq.setReason("Department requisition");

        TransactionResponse outResp = inventoryService.processTransaction(outReq);
        assertEquals(70, outResp.getPreviousQuantity());
        assertEquals(45, outResp.getResultingQuantity());
        assertEquals(45, productService.getProductById("P-E2E-STOCK-1").getQuantity());

        // 3. Invalid Stock Out: Request 100 units when only 45 available
        TransactionRequest invalidReq = new TransactionRequest();
        invalidReq.setProductId("P-E2E-STOCK-1");
        invalidReq.setTransactionType(TransactionType.STOCK_OUT);
        invalidReq.setQuantity(100);
        invalidReq.setReason("Excessive withdrawal");

        InsufficientStockException ex = assertThrows(
                InsufficientStockException.class,
                () -> inventoryService.processTransaction(invalidReq)
        );
        assertTrue(ex.getMessage().contains("Requested: 100, Available: 45"));

        // Verify balance rolled back to 45
        assertEquals(45, productService.getProductById("P-E2E-STOCK-1").getQuantity());
    }

    @Test
    @Transactional
    @DisplayName("Workflow 3: Low-Stock Detection and Valuation Reporting")
    void testLowStockAndReporting() {
        // Product below reorder level (quantity 3 <= reorder level 10)
        ProductRequest lowReq = new ProductRequest();
        lowReq.setId("P-E2E-LOW-1");
        lowReq.setName("Low Stock Screws");
        lowReq.setCategory("Hardware");
        lowReq.setProductType(ProductType.STANDARD);
        lowReq.setPrice(5.00);
        lowReq.setQuantity(3);
        lowReq.setReorderLevel(10);
        productService.createProduct(lowReq);

        DashboardSummaryResponse summary = reportService.getDashboardSummary();
        assertTrue(summary.getLowStockCount() >= 1, "Low stock count must be at least 1");
        assertTrue(summary.getTotalInventoryValuation() > 0, "Inventory valuation must be positive");
        assertFalse(summary.getCategorySummaries().isEmpty(), "Category summaries must be populated");

        boolean foundInLowStockList = summary.getLowStockProducts().stream()
                .anyMatch(p -> p.getId().equals("P-E2E-LOW-1"));
        assertTrue(foundInLowStockList, "Product must appear in low-stock list");
    }

    @Test
    @Transactional
    @DisplayName("Workflow 4: Anomaly Alert Generation and Review Lifecycle")
    void testAnomalyGenerationAndReview() {
        ProductRequest req = new ProductRequest();
        req.setId("P-E2E-ANOM-9");
        req.setName("High Value Drone");
        req.setCategory("Electronics");
        req.setProductType(ProductType.ELECTRONIC);
        req.setPrice(1200.00);
        req.setQuantity(50);
        req.setReorderLevel(5);
        productService.createProduct(req);

        // Deplete 45 out of 50 (90% drop) -> Critical Rule anomaly
        TransactionRequest tx = new TransactionRequest();
        tx.setProductId("P-E2E-ANOM-9");
        tx.setTransactionType(TransactionType.STOCK_OUT);
        tx.setQuantity(45);
        tx.setReason("Emergency project release");

        TransactionResponse resp = inventoryService.processTransaction(tx);
        assertTrue(resp.isFlaggedAsAnomaly());
        assertNotNull(resp.getAnomalyExplanation());

        // Find alert in repository
        List<AlertResponse> alerts = anomalyDetectionService.getAllAlerts(AlertStatus.OPEN);
        assertFalse(alerts.isEmpty(), "Open alerts must not be empty");

        String alertId = alerts.get(0).getId();

        // Mark as REVIEWED
        var reviewedAlert = anomalyDetectionService.updateStatus(alertId, AlertStatus.REVIEWED);
        assertEquals(AlertStatus.REVIEWED, reviewedAlert.getStatus());
        assertNotNull(reviewedAlert.getReviewedAt(), "Reviewed timestamp must be recorded");
    }

    @Test
    @Transactional
    @DisplayName("Workflow 5: CSV Export and Import Verification")
    void testCsvExportAndImport() {
        ProductRequest req = new ProductRequest();
        req.setId("P-E2E-CSV-1");
        req.setName("CSV Test Keyboard");
        req.setCategory("Electronics");
        req.setProductType(ProductType.ELECTRONIC);
        req.setPrice(75.00);
        req.setQuantity(10);
        req.setReorderLevel(2);
        productService.createProduct(req);

        // 1. Export Products
        byte[] productCsv = csvService.exportProductsToCsv();
        String csvString = new String(productCsv, StandardCharsets.UTF_8);
        assertTrue(csvString.contains("Product ID,Name,Category,Type"));
        assertTrue(csvString.contains("P-E2E-CSV-1"));

        // 2. Export Transactions
        byte[] txCsv = csvService.exportTransactionsToCsv();
        String txCsvString = new String(txCsv, StandardCharsets.UTF_8);
        assertTrue(txCsvString.contains("Transaction ID,Product ID,Type"));

        // 3. Import Products from CSV (1 valid row, 1 invalid row with negative price)
        String importPayload = "Product ID,Name,Category,Type,Price,Quantity,Reorder Level,Supplier ID,Expiry Date,Warranty Months\n"
                + "P-E2E-IMP-1,Imported Mouse,Electronics,STANDARD,25.00,100,20,,,\n"
                + "P-E2E-IMP-2,Invalid Item,Electronics,STANDARD,-10.00,50,10,,,\n";

        ByteArrayInputStream stream = new ByteArrayInputStream(importPayload.getBytes(StandardCharsets.UTF_8));
        CsvImportResult importResult = csvService.importProductsFromCsv(stream);

        assertEquals(1, importResult.getSuccessfulRows(), "1 valid product should be imported");
        assertEquals(1, importResult.getFailedRows(), "1 invalid product should fail");
        assertFalse(importResult.getErrors().isEmpty());
    }

    @Test
    @Transactional
    @DisplayName("Workflow 6: Idempotent Demo Data Seeding")
    void testRepeatableDemoSeeding() {
        var firstSeed = demoDataService.seedDemoData();
        assertEquals("SUCCESS", firstSeed.get("status"));

        var secondSeed = demoDataService.seedDemoData();
        assertEquals("SUCCESS", secondSeed.get("status"));
        assertEquals(0, secondSeed.get("productsSeeded"), "No duplicate products should be created");
        assertEquals(0, secondSeed.get("suppliersSeeded"), "No duplicate suppliers should be created");
    }
}
