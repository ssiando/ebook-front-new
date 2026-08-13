package com.mict.ebook.batch.dto;

import java.time.LocalDateTime;

public record BatchResponse(
        Long id,
        String batchCode,
        String batchName,
        String schedule,
        String description,
        boolean requiresPath,
        String lastRunStatus,
        LocalDateTime lastRunAt,
        Long registrantId,
        Long updaterId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
