package com.mict.ebook.bookset.dto;

import java.time.LocalDateTime;
import java.util.List;

public record BookSetResponse(
        Long id,
        String setName,
        String description,
        boolean activeYn,
        long bookCount,
        List<Long> bookIds,
        Long registrantId,
        Long updaterId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
