package com.stockmind.rest;

import com.stockmind.dto.AlertResponse;
import com.stockmind.dto.AlertStatusUpdateRequest;
import com.stockmind.enums.AlertStatus;
import com.stockmind.model.AnomalyAlert;
import com.stockmind.service.AnomalyDetectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AnomalyDetectionService anomalyDetectionService;

    public AlertController(AnomalyDetectionService anomalyDetectionService) {
        this.anomalyDetectionService = anomalyDetectionService;
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts(@RequestParam(value = "status", required = false) AlertStatus status) {
        List<AlertResponse> alerts = anomalyDetectionService.getAllAlerts(status);
        return ResponseEntity.ok(alerts);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AnomalyAlert> updateAlertStatus(
            @PathVariable("id") String id,
            @Valid @RequestBody AlertStatusUpdateRequest request) {
        AnomalyAlert updated = anomalyDetectionService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/count/open")
    public ResponseEntity<Map<String, Long>> getOpenAlertsCount() {
        long count = anomalyDetectionService.getOpenAlertCount();
        Map<String, Long> res = new HashMap<>();
        res.put("openAlerts", count);
        return ResponseEntity.ok(res);
    }
}
