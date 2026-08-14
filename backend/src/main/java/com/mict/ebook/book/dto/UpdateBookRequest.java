package com.mict.ebook.book.dto;

import com.mict.ebook.book.domain.BookType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateBookRequest(
        @NotBlank @Size(max = 300) String title,
        @Size(max = 500) String subtitle,
        @NotNull BookType bookType,
        @Positive Integer pageCount,
        @Size(max = 200) String copyrightOwner,
        LocalDate firstPublishDt,
        @Size(max = 200) String publisher,
        @Size(max = 20) String isbn,
        boolean freeYn,
        @Size(max = 1000) String coverImageUrl,
        @Size(max = 1000) String thumbnailUrl,
        boolean activeYn) {}
