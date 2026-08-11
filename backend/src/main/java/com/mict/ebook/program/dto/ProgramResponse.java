package com.mict.ebook.program.dto;

import java.time.LocalDateTime;

public record ProgramResponse(
        Long id,
        Long workspaceId,
        Long parentProgramId,
        String code,
        String name,
        String type,
        String httpMethod,
        String url,
        int sortOrder,
        boolean displayYn,
        boolean useYn,
        Long i18nKeyId,
        String description,
        Long registrantId,
        Long updaterId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
