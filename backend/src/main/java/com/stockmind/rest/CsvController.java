package com.stockmind.rest;

import com.stockmind.dto.CsvImportResult;
import com.stockmind.service.CsvService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/csv")
public class CsvController {

    private final CsvService csvService;

    public CsvController(CsvService csvService) {
        this.csvService = csvService;
    }

    @PostMapping("/import")
    public ResponseEntity<CsvImportResult> importProducts(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            CsvImportResult emptyResult = new CsvImportResult();
            emptyResult.addError(0, "Uploaded file is empty.");
            return ResponseEntity.badRequest().body(emptyResult);
        }

        CsvImportResult result = csvService.importProductsFromCsv(file.getInputStream());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/export/products")
    public ResponseEntity<byte[]> exportProducts() {
        byte[] csvData = csvService.exportProductsToCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"products_export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/export/transactions")
    public ResponseEntity<byte[]> exportTransactions() {
        byte[] csvData = csvService.exportTransactionsToCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"transactions_export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
