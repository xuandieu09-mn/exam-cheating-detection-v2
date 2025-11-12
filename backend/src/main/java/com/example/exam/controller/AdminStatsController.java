package com.example.exam.controller;

import com.example.exam.model.IncidentStatus;
import com.example.exam.repository.IncidentRepository;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final IncidentRepository incidentRepository;

    public AdminStatsController(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @GetMapping
    @Operation(summary = "Aggregated incidents stats (ADMIN only)")
    public ResponseEntity<Map<String, Object>> get() {
        long total = incidentRepository.count();
        long open = incidentRepository.countByStatus(IncidentStatus.OPEN);
        long confirmed = incidentRepository.countByStatus(IncidentStatus.CONFIRMED);
        long rejected = incidentRepository.countByStatus(IncidentStatus.REJECTED);
        return ResponseEntity.ok(Map.of(
                "total", total,
                "open", open,
                "confirmed", confirmed,
                "rejected", rejected
        ));
    }
}
