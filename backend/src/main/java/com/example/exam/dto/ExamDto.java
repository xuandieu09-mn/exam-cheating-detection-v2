package com.example.exam.dto;

import com.example.exam.model.Exam;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class ExamDto {

    public static class CreateRequest {
        @NotBlank
        public String name;
        public String description;
        public Instant startTime;
        public Integer durationMinutes; // optional; if provided, endTime = startTime + duration
        public Instant endTime; // or direct end time
        @NotNull
        public Integer retentionDays;
        public UUID createdBy;
    }

    public static class Response {
        public UUID id;
        public String name;
        public String description;
        public Instant startTime;
        public Instant endTime;
        public Integer retentionDays;
        public UUID createdBy;
        public Instant createdAt;
        public Instant updatedAt;

        public static Response from(Exam e) {
            Response r = new Response();
            r.id = e.getId();
            r.name = e.getName();
            r.description = e.getDescription();
            r.startTime = e.getStartTime();
            r.endTime = e.getEndTime();
            r.retentionDays = e.getRetentionDays();
            r.createdBy = e.getCreatedBy();
            r.createdAt = e.getCreatedAt();
            r.updatedAt = e.getUpdatedAt();
            return r;
        }
    }
}
