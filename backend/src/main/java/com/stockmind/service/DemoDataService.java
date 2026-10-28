package com.stockmind.service;

import com.stockmind.dto.ProductRequest;
import com.stockmind.dto.SupplierRequest;
import com.stockmind.dto.TransactionRequest;
import com.stockmind.enums.ProductType;
import com.stockmind.enums.TransactionType;
import com.stockmind.model.Product;
import com.stockmind.repository.ProductRepository;
import com.stockmind.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class DemoDataService {

    private final ProductService productService;
    private final SupplierService supplierService;
    private final InventoryService inventoryService;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public DemoDataService(ProductService productService,
                           SupplierService supplierService,
                           InventoryService inventoryService,
                           ProductRepository productRepository,
                           SupplierRepository supplierRepository) {
        this.productService = productService;
        this.supplierService = supplierService;
        this.inventoryService = inventoryService;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    /**
     * [VIVA SEARCH: IDEMPOTENT DEMO SEEDER]
     * Populates curated master vendors, polymorphic products, and baseline movements.
     * Idempotency guarantee: Uses existsById() pre-flight checks so repeated calls
     * do not duplicate primary keys or violate unique constraints.
     */
    @Transactional
    public Map<String, Object> seedDemoData() {
        int seededSuppliers = 0;
        int seededProducts = 0;
        int seededTransactions = 0;

        // [VIVA SEARCH: SEED SUPPLIERS]
        // 1. Seed Authentic Indian Suppliers Idempotently
        String[][] suppliers = {
                {"SUPP-AMUL-01", "Gujarat Co-operative Milk Marketing Federation (Amul)", "Ramesh Patel", "procurement@amul.coop", "+91-2692-258506", "Amul Dairy Road, Anand, Gujarat 388001"},
                {"SUPP-TATA-02", "Tata Consumer Products Ltd", "Priya Sharma", "orders@tataconsumer.com", "+91-22-6749-5200", "1 Kirloskar Business Park, Bellary Road, Bengaluru, Karnataka 560024"},
                {"SUPP-RELI-03", "Reliance Retail Wholesale Ltd", "Vikram Mehta", "b2b@relretail.com", "+91-22-3555-5000", "Reliance Corporate Park, Thane-Belapur Road, Navi Mumbai 400701"},
                {"SUPP-GODR-04", "Godrej Agrovet & FMCG Ltd", "Ananya Deshmukh", "sales@godrejagrovet.com", "+91-20-2792-8000", "Pirojshanagar, Eastern Express Highway, Vikhroli, Mumbai 400079"},
                {"SUPP-INFOR-05", "Infosys Hardware & Peripherals Distribution", "Arun Nair", "distribution@inforhardware.in", "+91-80-2852-0261", "Electronics City, Hosur Road, Bengaluru 560100"}
        };

        for (String[] s : suppliers) {
            SupplierRequest req = new SupplierRequest();
            req.setId(s[0]);
            req.setName(s[1]);
            req.setContactPerson(s[2]);
            req.setEmail(s[3]);
            req.setPhone(s[4]);
            req.setAddress(s[5]);

            if (!supplierRepository.existsById(s[0])) {
                supplierService.createSupplier(req);
                seededSuppliers++;
            } else {
                supplierService.updateSupplier(s[0], req);
            }
        }

        // 2. Seed Realistic Indian Inventory Across Categories with Physical Measurement Units
        Object[][] products = {
                // Perishable (Dairy & Groceries & Bakery)
                {"P-DAIRY-01", "Amul Taaza Homogenised Toned Milk 1L", "Dairy", ProductType.PERISHABLE, 68.00, 120, 30, "SUPP-AMUL-01", LocalDate.now().plusDays(14), null, "L"},
                {"P-DAIRY-02", "Amul Pasteurised Salted Butter 500g", "Dairy", ProductType.PERISHABLE, 275.00, 8, 20, "SUPP-AMUL-01", LocalDate.now().plusDays(60), null, "packets"},
                {"P-DAIRY-03", "Amul Malai Paneer Fresh Block 200g", "Dairy", ProductType.PERISHABLE, 95.00, 45, 15, "SUPP-AMUL-01", LocalDate.now().plusDays(25), null, "packets"},
                {"P-DAIRY-04", "Epigamia Greek Yogurt Natural 400g", "Dairy", ProductType.PERISHABLE, 130.00, 14, 10, "SUPP-AMUL-01", LocalDate.now().plusDays(12), null, "tubs"},
                {"P-GROC-01", "Tata Sampann Unpolished Toor Dal 1kg", "Groceries", ProductType.STANDARD, 185.00, 85, 25, "SUPP-TATA-02", null, null, "kg"},
                {"P-GROC-02", "India Gate Basmati Rice Feast Rozzana 5kg", "Groceries", ProductType.STANDARD, 460.00, 50, 15, "SUPP-RELI-03", null, null, "bags"},
                {"P-GROC-03", "Fortune Sunlite Refined Sunflower Oil 1L", "Groceries", ProductType.STANDARD, 145.00, 90, 20, "SUPP-RELI-03", null, null, "L"},
                {"P-GROC-04", "Tata Tea Premium Leaf Pouch 1kg", "Groceries", ProductType.STANDARD, 480.00, 40, 12, "SUPP-TATA-02", null, null, "packets"},
                {"P-GROC-05", "Aashirvaad Shudh Chakki Atta 10kg", "Groceries", ProductType.STANDARD, 445.00, 65, 20, "SUPP-RELI-03", null, null, "bags"},
                {"P-BAKE-01", "Britannia Whole Wheat Brown Bread 400g", "Bakery", ProductType.PERISHABLE, 50.00, 18, 10, "SUPP-GODR-04", LocalDate.now().plusDays(4), null, "loaves"},
                {"P-BAKE-02", "Parle-G Gold Glucose Biscuits Box (24pk)", "Bakery", ProductType.STANDARD, 240.00, 35, 10, "SUPP-GODR-04", null, null, "boxes"},
                {"P-BAKE-03", "Haldiram's Nagpur Aloo Bhujia 1kg", "Bakery", ProductType.STANDARD, 290.00, 60, 15, "SUPP-GODR-04", null, null, "packets"},

                // Electronics
                {"P-ELEC-01", "Dell UltraSharp 27-inch 4K USB-C Hub Monitor", "Electronics", ProductType.ELECTRONIC, 32500.00, 12, 5, "SUPP-INFOR-05", null, 36, "pcs"},
                {"P-ELEC-02", "Logitech MX Master 3S Wireless Performance Mouse", "Electronics", ProductType.ELECTRONIC, 8995.00, 24, 8, "SUPP-INFOR-05", null, 24, "pcs"},
                {"P-ELEC-03", "Keychron K2 Wireless Mechanical Keyboard", "Electronics", ProductType.ELECTRONIC, 7499.00, 5, 8, "SUPP-INFOR-05", null, 12, "pcs"},
                {"P-ELEC-04", "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", "Electronics", ProductType.ELECTRONIC, 29990.00, 15, 4, "SUPP-INFOR-05", null, 12, "pcs"},
                {"P-ELEC-05", "SanDisk Extreme Portable 1TB SSD USB 3.2", "Electronics", ProductType.ELECTRONIC, 9499.00, 30, 10, "SUPP-INFOR-05", null, 60, "pcs"},
                {"P-ELEC-06", "Anker 735 GaN Prime 65W Fast Charger", "Electronics", ProductType.ELECTRONIC, 3899.00, 45, 15, "SUPP-INFOR-05", null, 18, "pcs"},
                {"P-ELEC-07", "TP-Link Deco X50 Mesh WiFi 6 System (3-Pack)", "Electronics", ProductType.ELECTRONIC, 16999.00, 8, 4, "SUPP-INFOR-05", null, 36, "sets"},
                {"P-ELEC-08", "APC Back-UPS 1100VA 230V Inverter", "Electronics", ProductType.ELECTRONIC, 6200.00, 16, 5, "SUPP-INFOR-05", null, 24, "pcs"},

                // Office & Workspace Supplies (Standard)
                {"P-OFF-01", "JK Copier Paper 75 GSM A4 (Case of 5 Reams)", "Office", ProductType.STANDARD, 1550.00, 40, 12, "SUPP-RELI-03", null, null, "cases"},
                {"P-OFF-02", "Featherlite High-Back Ergonomic Mesh Chair", "Office", ProductType.STANDARD, 14500.00, 6, 4, "SUPP-RELI-03", null, null, "pcs"},
                {"P-OFF-03", "Camlin Kokuyo Whiteboard Marker Set (10pk)", "Office", ProductType.STANDARD, 320.00, 80, 20, "SUPP-RELI-03", null, null, "sets"},
                {"P-OFF-04", "Classmate Pulse Spiral Executive Notebook (6pk)", "Office", ProductType.STANDARD, 540.00, 55, 15, "SUPP-RELI-03", null, null, "packs"},
                {"P-OFF-05", "Kangaro Heavy Duty Paper Punch DP-800", "Office", ProductType.STANDARD, 650.00, 22, 8, "SUPP-RELI-03", null, null, "pcs"},
                {"P-OFF-06", "Solo Executive Ring Binder Folder (Pack of 10)", "Office", ProductType.STANDARD, 1200.00, 35, 10, "SUPP-RELI-03", null, null, "packs"},

                // Hardware & Industrial Tools (Standard)
                {"P-HARD-01", "Bosch Professional GSB 500W Impact Drill Kit", "Hardware", ProductType.STANDARD, 4299.00, 14, 6, "SUPP-INFOR-05", null, null, "kits"},
                {"P-HARD-02", "Stanley Steel Measuring Tape 5m Metric", "Hardware", ProductType.STANDARD, 340.00, 48, 15, "SUPP-INFOR-05", null, null, "pcs"},
                {"P-HARD-03", "Taparia Universal Tool Set with Hard Case (82pc)", "Hardware", ProductType.STANDARD, 6850.00, 4, 5, "SUPP-INFOR-05", null, null, "sets"},
                {"P-HARD-04", "Havells Heavy Duty Industrial Extension Reel 15m", "Hardware", ProductType.STANDARD, 2150.00, 18, 6, "SUPP-INFOR-05", null, null, "reels"},

                // Industrial Safety Gear & Apparel (Standard)
                {"P-APP-01", "Karam Industrial High-Visibility Safety Vest XL", "Apparel", ProductType.STANDARD, 450.00, 75, 20, "SUPP-RELI-03", null, null, "pcs"},
                {"P-APP-02", "Allen Cooper Steel-Toe Safety Shoes Size 9", "Apparel", ProductType.STANDARD, 2400.00, 12, 5, "SUPP-RELI-03", null, null, "pairs"},
                {"P-APP-03", "3M Nitrile Industrial Heavy Work Gloves", "Apparel", ProductType.STANDARD, 350.00, 90, 25, "SUPP-RELI-03", null, null, "pairs"},
                {"P-APP-04", "Udyogi Heavy Duty Safety Helmet with Ratchet", "Apparel", ProductType.STANDARD, 550.00, 30, 10, "SUPP-RELI-03", null, null, "pcs"}
        };

        for (Object[] p : products) {
            String pId = (String) p[0];
            ProductRequest req = new ProductRequest();
            req.setId(pId);
            req.setName((String) p[1]);
            req.setCategory((String) p[2]);
            req.setProductType((ProductType) p[3]);
            req.setPrice((Double) p[4]);
            req.setQuantity((Integer) p[5]);
            req.setReorderLevel((Integer) p[6]);
            req.setSupplierId((String) p[7]);
            req.setExpiryDate((LocalDate) p[8]);
            req.setWarrantyMonths((Integer) p[9]);
            req.setUnit((String) p[10]);

            // [VIVA SEARCH: IDEMPOTENCY CHECK - PRODUCTS]
            // If SKU does not exist in PostgreSQL, insert new; otherwise, synchronize attributes without duplicating.
            if (!productRepository.existsById(pId)) {
                productService.createProduct(req);
                seededProducts++;
            } else {
                productService.updateProduct(pId, req);
            }
        }

        // [VIVA SEARCH: SEED TRANSACTIONS]
        // 3. Seed Realistic Stock Transactions through InventoryService
        // (Invokes InventoryService.processTransaction to enforce Java OOP mutations & anomaly checks)
        try {
            if (productRepository.existsById("P-DAIRY-01")) {
                TransactionRequest tx1 = new TransactionRequest();
                tx1.setProductId("P-DAIRY-01");
                tx1.setTransactionType(TransactionType.STOCK_IN);
                tx1.setQuantity(40);
                tx1.setReason("Weekly refrigerated Amul depot delivery PO-8842");
                inventoryService.processTransaction(tx1);
                seededTransactions++;
            }
        } catch (Exception ignored) {}

        try {
            if (productRepository.existsById("P-GROC-01")) {
                Product p = productService.getProductById("P-GROC-01");
                if (p.getQuantity() >= 10) {
                    TransactionRequest tx2 = new TransactionRequest();
                    tx2.setProductId("P-GROC-01");
                    tx2.setTransactionType(TransactionType.STOCK_OUT);
                    tx2.setQuantity(10);
                    tx2.setReason("Dispatch to Retail Store Indiranagar");
                    inventoryService.processTransaction(tx2);
                    seededTransactions++;
                }
            }
        } catch (Exception ignored) {}

        try {
            if (productRepository.existsById("P-ELEC-02")) {
                Product p = productService.getProductById("P-ELEC-02");
                int damageQty = Math.min(3, p.getQuantity() / 2);
                if (damageQty > 0) {
                    TransactionRequest tx3 = new TransactionRequest();
                    tx3.setProductId("P-ELEC-02");
                    tx3.setTransactionType(TransactionType.DAMAGE);
                    tx3.setQuantity(damageQty);
                    tx3.setReason("Water leakage damage during monsoon warehouse storage");
                    inventoryService.processTransaction(tx3);
                    seededTransactions++;
                }
            }
        } catch (Exception ignored) {}

        try {
            if (productRepository.existsById("P-ELEC-01")) {
                Product p = productService.getProductById("P-ELEC-01");
                int outQty = Math.min(2, p.getQuantity() / 2);
                if (outQty > 0) {
                    TransactionRequest tx4 = new TransactionRequest();
                    tx4.setProductId("P-ELEC-01");
                    tx4.setTransactionType(TransactionType.STOCK_OUT);
                    tx4.setQuantity(outQty);
                    tx4.setReason("Corporate client IT infrastructure bulk setup");
                    inventoryService.processTransaction(tx4);
                    seededTransactions++;
                }
            }
        } catch (Exception ignored) {}

        try {
            if (productRepository.existsById("P-OFF-01")) {
                TransactionRequest tx5 = new TransactionRequest();
                tx5.setProductId("P-OFF-01");
                tx5.setTransactionType(TransactionType.ADJUSTMENT);
                tx5.setQuantity(5);
                tx5.setReason("Quarterly physical audit discovered 5 uncatalogued cases in bay B-3");
                inventoryService.processTransaction(tx5);
                seededTransactions++;
            }
        } catch (Exception ignored) {}

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("suppliersSeeded", seededSuppliers);
        res.put("productsSeeded", seededProducts);
        res.put("transactionsSeeded", seededTransactions);
        res.put("message", "Seeded Indian enterprise catalog with physical units and INR pricing.");
        return res;
    }
}
