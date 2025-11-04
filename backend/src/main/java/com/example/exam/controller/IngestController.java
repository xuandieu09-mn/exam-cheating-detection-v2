package com.example.exam.controller;

import com.example.exam.dto.EventIngestDto;
import com.example.exam.dto.SnapshotIngestDto;
import com.example.exam.dto.SnapshotUploadDto;
import com.example.exam.service.IngestService;
import com.example.exam.service.MediaStorageService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ingest")
public class IngestController {
    private final IngestService ingestService;
    private final MediaStorageService mediaStorageService;

    public IngestController(IngestService ingestService, MediaStorageService mediaStorageService) {
        this.ingestService = ingestService;
        this.mediaStorageService = mediaStorageService;
    }

    @PostMapping("/events")
    @Operation(summary = "Ingest events (idempotent)")
    public ResponseEntity<EventIngestDto.Result> ingestEvents(@Valid @RequestBody EventIngestDto.Request request) {
        var result = ingestService.ingestEvents(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/snapshots")
    @Operation(summary = "Ingest media snapshots (idempotent)")
    public ResponseEntity<SnapshotIngestDto.Result> ingestSnapshots(@Valid @RequestBody SnapshotIngestDto.Request request) {
        var result = ingestService.ingestSnapshots(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/snapshots/upload")
    @Operation(summary = "Upload snapshots as base64 and ingest (writes to disk, idempotent)")
    public ResponseEntity<SnapshotUploadDto.Result> uploadSnapshots(@Valid @RequestBody SnapshotUploadDto.Request request) {
        // Store images to disk and transform to SnapshotIngestDto to reuse existing path
        var ingestReq = mediaStorageService.prepareIngestRequest(request);
        var ingestResult = ingestService.ingestSnapshots(ingestReq);
        return ResponseEntity.ok(new SnapshotUploadDto.Result(ingestResult.created, ingestResult.duplicates, ingestResult.ids));
    }
}
