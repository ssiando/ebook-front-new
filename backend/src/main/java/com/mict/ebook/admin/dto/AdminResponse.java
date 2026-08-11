package com.mict.ebook.admin.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AdminResponse(
        Long id,
        String adminName,
        String email,
        boolean activeYn,
        int failCount,
        Long registrantId,
        Long updaterId,
        LocalDateTime lastLoginAt,
        String lastLoginIp,
        List<Long> roleIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
