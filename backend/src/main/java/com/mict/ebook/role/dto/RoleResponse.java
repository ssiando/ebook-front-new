package com.mict.ebook.role.dto;

import com.mict.ebook.role.domain.SystemType;
import java.time.LocalDateTime;
import java.util.List;

public record RoleResponse(
        Long id,
        String roleName,
        String description,
        SystemType system,
        String registrant,
        long memberCount,
        List<String> programIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
