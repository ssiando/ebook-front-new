package com.mict.ebook.workspace.dto;

import java.time.LocalDateTime;

public record WorkspaceResponse(
        Long id,
        String name,
        String stat,
        String description,
        Long registrantId,
        Long updaterId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
