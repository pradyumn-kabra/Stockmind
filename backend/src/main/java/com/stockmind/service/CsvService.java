package com.stockmind.service;

import com.stockmind.dto.CsvImportResult;
import com.stockmind.dto.ProductRequest;
import com.stockmind.enums.ProductType;
import com.stockmind.model.ElectronicProduct;
import com.stockmind.model.PerishableProduct;
import com.stockmind.model.Product;
import com.stockmind.model.StockTransaction;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
public class CsvService {

    private final ProductService productService;
    private final InventoryService inventoryService;

    public CsvService(ProductService productService, InventoryService inventoryService) {
        this.productService = productService;
        this.inventoryService = inventoryService;
    }

    // [VIVA SEARCH: CSV EXPORT]
    // Streams RFC 4180 compliant CSV bytes for all active products, including units and expiry dates.
    public byte[] exportProductsToCsv() {
        List<Product> products = productService.getAllProducts(null, null, null);
        StringBuilder sb = new StringBuilder();
        sb.append("Product ID,Name,Category,Type,Price,Quantity,Unit,Reorder Level,Supplier ID,Expiry Date,Warranty Months,Active\n");

        for (Product p : products) {
            String expiry = "";
            String warranty = "";
            if (p instanceof PerishableProduct pp && pp.getExpiryDate() != null) {
                expiry = pp.getExpiryDate().toString();
            } else if (p instanceof ElectronicProduct ep) {
                warranty = String.valueOf(ep.getWarrantyMonths());
            }

            sb.append(escapeSpecialCharacters(p.getId())).append(",")
              .append(escapeSpecialCharacters(p.getName())).append(",")
              .append(escapeSpecialCharacters(p.getCategory())).append(",")
              .append(p.getProductType()).append(",")
              .append(p.getPrice()).append(",")
              .append(p.getQuantity()).append(",")
              .append(escapeSpecialCharacters(p.getUnit())).append(",")
              .append(p.getReorderLevel()).append(",")
              .append(p.getSupplierId() != null ? escapeSpecialCharacters(p.getSupplierId()) : "").append(",")
              .append(expiry).append(",")
              .append(warranty).append(",")
              .append(p.isActive()).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportTransactionsToCsv() {
        List<StockTransaction> transactions = inventoryService.getTransactionHistory(null);
        StringBuilder sb = new StringBuilder();
        sb.append("Transaction ID,Product ID,Type,Quantity,Previous Quantity,Resulting Quantity,Reason,Created At\n");

        for (StockTransaction tx : transactions) {
            sb.append(escapeSpecialCharacters(tx.getId())).append(",")
              .append(escapeSpecialCharacters(tx.getProductId())).append(",")
              .append(tx.getTransactionType()).append(",")
              .append(tx.getQuantity()).append(",")
              .append(tx.getPreviousQuantity()).append(",")
              .append(tx.getResultingQuantity()).append(",")
              .append(escapeSpecialCharacters(tx.getReason())).append(",")
              .append(tx.getCreatedAt()).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // [VIVA SEARCH: CSV IMPORT] & [VIVA SEARCH: BULK DATA PROCESSING]
    // Parses CSV input stream line-by-line, validating rows individually and returning diagnostics.
    public CsvImportResult importProductsFromCsv(InputStream inputStream) {
        CsvImportResult result = new CsvImportResult();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                result.addError(0, "CSV file is empty.");
                return result;
            }

            String line;
            int rowNumber = 1;
            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.trim().isEmpty()) continue;

                String[] columns = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                if (columns.length < 7) {
                    result.addError(rowNumber, "Insufficient columns. Expected at least 7 fields, found " + columns.length);
                    continue;
                }

                try {
                    ProductRequest req = new ProductRequest();
                    req.setId(cleanColumn(columns[0]));
                    req.setName(cleanColumn(columns[1]));
                    req.setCategory(cleanColumn(columns[2]));

                    String typeStr = cleanColumn(columns[3]).toUpperCase();
                    try {
                        req.setProductType(ProductType.valueOf(typeStr));
                    } catch (IllegalArgumentException e) {
                        req.setProductType(ProductType.STANDARD);
                    }

                    req.setPrice(Double.parseDouble(cleanColumn(columns[4])));
                    req.setQuantity(Integer.parseInt(cleanColumn(columns[5])));

                    int reorderIdx = 6;
                    // Detect if column 6 is non-numeric unit or numeric reorderLevel
                    String col6 = cleanColumn(columns[6]);
                    boolean col6IsNumber = false;
                    try {
                        Integer.parseInt(col6);
                        col6IsNumber = true;
                    } catch (NumberFormatException ignored) {}

                    if (!col6IsNumber && !col6.isEmpty()) {
                        req.setUnit(col6);
                        reorderIdx = 7;
                    } else {
                        req.setUnit("units");
                    }

                    if (columns.length > reorderIdx && !cleanColumn(columns[reorderIdx]).isEmpty()) {
                        req.setReorderLevel(Integer.parseInt(cleanColumn(columns[reorderIdx])));
                    }

                    int suppIdx = reorderIdx + 1;
                    if (columns.length > suppIdx && !cleanColumn(columns[suppIdx]).isEmpty()) {
                        req.setSupplierId(cleanColumn(columns[suppIdx]));
                    }

                    int expIdx = suppIdx + 1;
                    if (columns.length > expIdx && !cleanColumn(columns[expIdx]).isEmpty()) {
                        try {
                            req.setExpiryDate(LocalDate.parse(cleanColumn(columns[expIdx])));
                        } catch (Exception ignored) {}
                    }

                    int warIdx = expIdx + 1;
                    if (columns.length > warIdx && !cleanColumn(columns[warIdx]).isEmpty()) {
                        try {
                            req.setWarrantyMonths(Integer.parseInt(cleanColumn(columns[warIdx])));
                        } catch (Exception ignored) {}
                    }

                    productService.createProduct(req);
                    result.incrementSuccess();
                } catch (Exception e) {
                    result.addError(rowNumber, e.getMessage());
                }
            }
        } catch (IOException e) {
            result.addError(0, "Error reading CSV stream: " + e.getMessage());
        }

        return result;
    }

    private String cleanColumn(String col) {
        if (col == null) return "";
        String s = col.trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1).replace("\"\"", "\"");
        }
        return s.trim();
    }

    private String escapeSpecialCharacters(String data) {
        if (data == null) return "";
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
