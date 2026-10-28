package com.stockmind;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockmind.dto.ProductRequest;
import com.stockmind.dto.TransactionRequest;
import com.stockmind.enums.ProductType;
import com.stockmind.enums.TransactionType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Final Functional Smoke Test (REST API Level)")
class StockMindSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Complete 11-Step Functional Smoke Test Flow")
    void testCompleteSmokeWorkflow() throws Exception {
        // Step 1: Open the dashboard (GET /api/reports/dashboard)
        mockMvc.perform(get("/api/reports/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalActiveProducts").isNumber())
                .andExpect(jsonPath("$.totalInventoryValuation").isNumber());

        // Step 2: Create a test product through the API (POST /api/products)
        ProductRequest productReq = new ProductRequest();
        productReq.setId("P-SMOKE-101");
        productReq.setName("Smoke Test Wireless Mouse");
        productReq.setCategory("Electronics");
        productReq.setProductType(ProductType.ELECTRONIC);
        productReq.setPrice(49.99);
        productReq.setQuantity(50);
        productReq.setReorderLevel(15);
        productReq.setWarrantyMonths(24);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("P-SMOKE-101")))
                .andExpect(jsonPath("$.quantity", is(50)));

        // Step 3: Confirm product appears in the product list (GET /api/products)
        mockMvc.perform(get("/api/products?query=P-SMOKE-101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id", is("P-SMOKE-101")));

        // Step 4: Record a stock-in transaction (+20 units -> 70)
        TransactionRequest stockInReq = new TransactionRequest();
        stockInReq.setProductId("P-SMOKE-101");
        stockInReq.setTransactionType(TransactionType.STOCK_IN);
        stockInReq.setQuantity(20);
        stockInReq.setReason("Supplier delivery");

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stockInReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.previousQuantity", is(50)))
                .andExpect(jsonPath("$.resultingQuantity", is(70)));

        // Step 5: Record a valid stock-out transaction (-15 units -> 55)
        TransactionRequest stockOutReq = new TransactionRequest();
        stockOutReq.setProductId("P-SMOKE-101");
        stockOutReq.setTransactionType(TransactionType.STOCK_OUT);
        stockOutReq.setQuantity(15);
        stockOutReq.setReason("Customer order #1089");

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stockOutReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.previousQuantity", is(70)))
                .andExpect(jsonPath("$.resultingQuantity", is(55)));

        // Step 6: Attempt an invalid stock-out (-100 units when only 55 available) -> MUST BE REJECTED
        TransactionRequest invalidOutReq = new TransactionRequest();
        invalidOutReq.setProductId("P-SMOKE-101");
        invalidOutReq.setTransactionType(TransactionType.STOCK_OUT);
        invalidOutReq.setQuantity(100);
        invalidOutReq.setReason("Excessive order attempt");

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidOutReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("INSUFFICIENT_STOCK")))
                .andExpect(jsonPath("$.message", containsString("Requested: 100, Available: 55")));

        // Step 7: Verify transaction history and balance remains 55
        mockMvc.perform(get("/api/products/P-SMOKE-101/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));

        mockMvc.perform(get("/api/products/P-SMOKE-101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity", is(55)));

        // Step 8 & 9: Trigger Drastic Stock-Out to test Low-Stock and Anomaly Detection
        // Withdraw 45 out of 55 (81.8% drop -> Critical anomaly and leaves 10 units <= reorderLevel 15 -> Low Stock!)
        TransactionRequest anomalyReq = new TransactionRequest();
        anomalyReq.setProductId("P-SMOKE-101");
        anomalyReq.setTransactionType(TransactionType.STOCK_OUT);
        anomalyReq.setQuantity(45);
        anomalyReq.setReason("Emergency bulk withdrawal");

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(anomalyReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.flaggedAsAnomaly", is(true)))
                .andExpect(jsonPath("$.anomalyExplanation", containsString("Critical stock reduction")))
                .andExpect(jsonPath("$.resultingQuantity", is(10)));

        // Step 10: Check Anomaly Alert in Alert Review Center
        mockMvc.perform(get("/api/alerts?status=OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].severity", anyOf(is("CRITICAL"), is("HIGH"))));

        // Step 11: Open the reports page and confirm low-stock alert appears
        mockMvc.perform(get("/api/reports/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lowStockCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.categorySummaries", hasSize(greaterThanOrEqualTo(1))));
    }
}
