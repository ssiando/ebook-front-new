package com.mict.ebook.menu.dto;

import java.time.LocalDateTime;

public record MenuResponse(
        String id,
        String parentId,
        String label,
        String path,
        int sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
