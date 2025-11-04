package com.example.exam.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class StartSessionRequest {
    @NotNull
    private UUID examId;

    @NotNull
    private UUID userId;

    public UUID getExamId() {
        return examId;
    }

    public void setExamId(UUID examId) {
        this.examId = examId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}
