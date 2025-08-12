package com.matchme.matchme.controllers;

import com.matchme.matchme.services.TestDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test-data")
public class TestDataController {

    private final TestDataService testDataService;

    @Autowired
    public TestDataController(TestDataService testDataService) {
        this.testDataService = testDataService;
    }

    /**
     * Generate a specified number of test users
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateTestUsers(@RequestParam(defaultValue = "100") int count) {
        if (count < 1) {
            return ResponseEntity.badRequest().body(Map.of("error", "Count must be at least 1"));
        }
        
        int created = testDataService.generateUsers(count);
        return ResponseEntity.ok(Map.of(
            "message", "Successfully created test users",
            "count", created
        ));
    }

    /**
     * Delete all test users
     */
    @DeleteMapping("/clean")
    public ResponseEntity<Map<String, Object>> deleteTestUsers() {
        int deleted = testDataService.deleteTestUsers();
        return ResponseEntity.ok(Map.of(
            "message", "Successfully deleted test users",
            "count", deleted
        ));
    }
}