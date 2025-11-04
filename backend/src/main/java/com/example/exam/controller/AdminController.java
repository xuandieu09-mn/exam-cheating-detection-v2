package com.example.exam.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/ping")
    @io.swagger.v3.oas.annotations.Operation(
            summary = "Admin ping",
            description = "Returns a simple OK payload; requires ROLE_ADMIN"
    )
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
