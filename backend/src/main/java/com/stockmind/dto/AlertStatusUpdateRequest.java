package com.stockmind.dto;

import com.stockmind.enums.AlertStatus;
import jakarta.validation.constraints.NotNull;

public class AlertStatusUpdateRequest {
    @NotNull(message = "Alert status is required")
    private AlertStatus status;

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }
}
