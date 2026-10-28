package com.stockmind.exceptions;

public class DuplicateProductException extends RuntimeException {
    public DuplicateProductException(String productId) {
        super("A product with ID '" + productId + "' already exists.");
    }
}
