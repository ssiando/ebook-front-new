package com.mict.ebook.role.dto;

import java.time.LocalDateTime;
import java.util.List;

public record RoleResponse(
        Long id,
        Long workspaceId,
        String roleName,
        String description,
        boolean activeYn,
        Long registrantId,
        Long updaterId,
        long memberCount,
        List<Long> programIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
