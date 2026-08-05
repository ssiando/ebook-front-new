package com.mict.ebook.role.dto;

import java.time.LocalDateTime;
import java.util.List;

public record RoleResponse(
        Long id,
        String roleName,
        String description,
        String registrant,
        long memberCount,
        List<String> programIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
