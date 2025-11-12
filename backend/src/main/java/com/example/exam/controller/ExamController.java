package com.example.exam.controller;

import com.example.exam.dto.ExamDto;
import com.example.exam.model.Exam;
import com.example.exam.repository.ExamRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/admin/exams")
@Tag(name = "Exams")
public class ExamController {

    private final ExamRepository examRepository;

    public ExamController(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    @PostMapping
    @Operation(summary = "Create exam (ADMIN only)")
    public ResponseEntity<ExamDto.Response> create(@Valid @RequestBody ExamDto.CreateRequest req) {
        Exam e = new Exam();
        e.setName(req.name);
        e.setDescription(req.description);
        // Determine start/end
        if (req.startTime != null && req.durationMinutes != null && req.durationMinutes > 0) {
            e.setStartTime(req.startTime);
            e.setEndTime(req.startTime.plus(req.durationMinutes, ChronoUnit.MINUTES));
        } else {
            e.setStartTime(req.startTime);
            e.setEndTime(req.endTime);
        }
        e.setRetentionDays(req.retentionDays != null ? req.retentionDays : 30);
        e.setCreatedBy(req.createdBy);
        Instant now = Instant.now();
        e.setCreatedAt(now);
        e.setUpdatedAt(now);

        Exam saved = examRepository.save(e);
        return ResponseEntity.ok(ExamDto.Response.from(saved));
    }

    @GetMapping
    @Operation(summary = "List exams (ADMIN only)")
    public ResponseEntity<List<ExamDto.Response>> list() {
        List<ExamDto.Response> data = examRepository.findAll().stream().map(ExamDto.Response::from).toList();
        return ResponseEntity.ok(data);
    }
}
