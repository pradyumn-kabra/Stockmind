package com.stockmind.rest;

import com.stockmind.dto.DashboardSummaryResponse;
import com.stockmind.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        DashboardSummaryResponse summary = reportService.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/timeseries")
    public ResponseEntity<java.util.List<com.stockmind.dto.TimeSeriesDataPoint>> getTimeSeries(
            @org.springframework.web.bind.annotation.RequestParam(value = "range", required = false, defaultValue = "6m") String range) {
        return ResponseEntity.ok(reportService.getTimeSeriesAnalytics(range));
    }
}
