package com.mict.ebook.book.dto;

import com.mict.ebook.book.domain.BookType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookResponse(
        Long id,
        String title,
        String subtitle,
        BookType bookType,
        Integer pageCount,
        String copyrightOwner,
        LocalDate firstPublishDt,
        String publisher,
        String isbn,
        boolean freeYn,
        String coverImageUrl,
        String thumbnailUrl,
        boolean activeYn,
        Long registrantId,
        Long updaterId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
