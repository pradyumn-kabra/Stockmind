package com.stockmind.dto;

import java.util.ArrayList;
import java.util.List;

public class CsvImportResult {
    private int totalRows;
    private int successfulRows;
    private int failedRows;
    private List<String> errors = new ArrayList<>();

    public void incrementSuccess() {
        successfulRows++;
        totalRows++;
    }

    public void addError(int rowNumber, String message) {
        failedRows++;
        totalRows++;
        errors.add("Row " + rowNumber + ": " + message);
    }

    public int getTotalRows() { return totalRows; }
    public int getSuccessfulRows() { return successfulRows; }
    public int getFailedRows() { return failedRows; }
    public List<String> getErrors() { return errors; }
}
