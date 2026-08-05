package com.mict.ebook.commoncode.dto;

import java.time.LocalDateTime;

public record CodeGroupResponse(
        Long id,
        String groupCode,
        String groupName,
        String description,
        boolean useYn,
        String i18nKey,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
