package com.example.exam.repository;

import com.example.exam.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findBySessionIdOrderByTsAsc(UUID sessionId);
    Optional<Event> findByIdempotencyKey(String idempotencyKey);
}
