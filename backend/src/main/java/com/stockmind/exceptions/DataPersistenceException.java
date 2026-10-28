package com.stockmind.exceptions;

public class DataPersistenceException extends RuntimeException {
    public DataPersistenceException(String message, Throwable cause) {
        super(message, cause);
    }

    public DataPersistenceException(String message) {
        super(message);
    }
}
