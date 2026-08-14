package com.mict.ebook.book.dto;

import com.mict.ebook.book.domain.PublishStatus;
import java.time.LocalDateTime;

public record BookRevisionResponse(
        Long id,
        Long bookId,
        int revisionNo,
        boolean publishedYn,
        PublishStatus publishStatusCd,
        String fileName,
        String filePath,
        int encryptStatusCd,
        Long registrantId,
        Long updaterId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
