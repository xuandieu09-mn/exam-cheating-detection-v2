package com.example.exam.service;

import com.example.exam.dto.EventIngestDto;
import com.example.exam.dto.SnapshotIngestDto;
import com.example.exam.model.Event;
import com.example.exam.model.MediaSnapshot;
import com.example.exam.repository.EventRepository;
import com.example.exam.repository.MediaSnapshotRepository;
import com.example.exam.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class IngestService {
    private final SessionRepository sessionRepository;
    private final EventRepository eventRepository;
    private final MediaSnapshotRepository snapshotRepository;

    public IngestService(SessionRepository sessionRepository,
                         EventRepository eventRepository,
                         MediaSnapshotRepository snapshotRepository) {
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
        this.snapshotRepository = snapshotRepository;
    }

    @Transactional
    public EventIngestDto.Result ingestEvents(EventIngestDto.Request req) {
        int created = 0;
        int dup = 0;
        List<UUID> ids = new ArrayList<>();

        for (var item : req.items) {
            // Validate session existence (defensive null guard)
            var sessionId = item.sessionId;
            if (sessionId == null || !sessionRepository.existsById(sessionId)) {
                // Skip invalid session; alternatively could throw 404
                continue;
            }

            var existing = eventRepository.findByIdempotencyKey(item.idempotencyKey);
            if (existing.isPresent()) {
                dup++;
                ids.add(existing.get().getId());
                continue;
            }

            Event e = new Event();
            e.setSessionId(sessionId);
            e.setTs(item.ts);
            e.setEventType(item.eventType);
            e.setDetails(item.details);
            e.setIdempotencyKey(item.idempotencyKey);
            e.setCreatedAt(Instant.now());

            e = eventRepository.save(e);
            created++;
            ids.add(e.getId());
        }

        return new EventIngestDto.Result(created, dup, ids);
    }

    @Transactional
    public SnapshotIngestDto.Result ingestSnapshots(SnapshotIngestDto.Request req) {
        int created = 0;
        int dup = 0;
        List<UUID> ids = new ArrayList<>();

        for (var item : req.items) {
            var sessionId = item.sessionId;
            if (sessionId == null || !sessionRepository.existsById(sessionId)) {
                continue;
            }

            var existing = snapshotRepository.findByIdempotencyKey(item.idempotencyKey);
            if (existing.isPresent()) {
                dup++;
                ids.add(existing.get().getId());
                continue;
            }

            MediaSnapshot s = new MediaSnapshot();
            s.setSessionId(sessionId);
            s.setTs(item.ts);
            s.setObjectKey(item.objectKey);
            s.setFileSize(item.fileSize);
            s.setMimeType(item.mimeType);
            s.setUploadedAt(Instant.now());
            s.setFaceCount(item.faceCount);
            s.setIdempotencyKey(item.idempotencyKey);

            s = snapshotRepository.save(s);
            created++;
            ids.add(s.getId());
        }

        return new SnapshotIngestDto.Result(created, dup, ids);
    }
}
