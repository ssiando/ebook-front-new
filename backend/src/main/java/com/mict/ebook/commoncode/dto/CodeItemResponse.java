package com.mict.ebook.commoncode.dto;

import java.time.LocalDateTime;

public record CodeItemResponse(
        Long id,
        Long groupId,
        String code,
        String codeName,
        int sortOrder,
        boolean useYn,
        String description,
        String metadata,
        String i18nKey,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
