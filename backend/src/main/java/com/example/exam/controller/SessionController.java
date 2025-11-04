package com.example.exam.controller;

import com.example.exam.model.Session;
import com.example.exam.model.SessionStatus;
import com.example.exam.repository.SessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.lang.NonNull;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionRepository sessionRepository;

    public SessionController(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    // Start a session: body {"examId":"...","userId":"..."}
    @PostMapping("/start")
    public ResponseEntity<Session> startSession(@RequestBody Map<String, String> body) {
        UUID examId = UUID.fromString(body.get("examId"));
        UUID userId = UUID.fromString(body.get("userId"));

        Session s = new Session();
        s.setExamId(examId);
        s.setUserId(userId);
        s.setStartedAt(Instant.now());
    // Set status explicitly using enum mapping
    s.setStatus(SessionStatus.ACTIVE);

        Session saved = sessionRepository.save(s);
        return ResponseEntity.ok(saved);
    }

    // List sessions (simple pagination later)
    @GetMapping
    public ResponseEntity<List<Session>> listSessions() {
        return ResponseEntity.ok(sessionRepository.findAll());
    }

    // Get session by id
    @GetMapping("/{id}")
    public ResponseEntity<Session> getSession(@PathVariable("id") @NonNull UUID id) {
        return sessionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<?> endSession(@PathVariable("id") @NonNull UUID id) {
        Optional<Session> maybe = sessionRepository.findById(id);
        if (maybe.isEmpty()) return ResponseEntity.notFound().build();
        Session s = maybe.get();
    s.setEndedAt(Instant.now());
    s.setStatus(SessionStatus.ENDED);
        sessionRepository.save(s);
        return ResponseEntity.ok(s);
    }
}
