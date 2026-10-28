package com.stockmind.rest;

import com.stockmind.service.DemoDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final DemoDataService demoDataService;

    public DemoController(DemoDataService demoDataService) {
        this.demoDataService = demoDataService;
    }

    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> seedDemoData() {
        Map<String, Object> result = demoDataService.seedDemoData();
        return ResponseEntity.ok(result);
    }
}
