package com.mict.ebook.admin.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdminResponse(
        Long id,
        String adminId,
        String adminName,
        String email,
        String department,
        List<String> groups,
        LocalDate serviceExpiresAt,
        LocalDateTime lastLoginAt,
        String status,
        String registrant,
        List<Long> roleIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
