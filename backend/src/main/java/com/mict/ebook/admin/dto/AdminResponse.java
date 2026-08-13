package com.mict.ebook.admin.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AdminResponse(
        Long id,
        String loginId,
        String adminName,
        String email,
        String department,
        boolean activeYn,
        String status,
        int failCount,
        Long registrantId,
        Long updaterId,
        LocalDateTime lastLoginAt,
        String lastLoginIp,
        List<Long> roleIds,
        List<String> groupCodes,
        LocalDateTime serviceExpiresAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
