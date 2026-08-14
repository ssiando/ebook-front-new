package com.mict.ebook.book.dto;

import com.mict.ebook.book.domain.PublishStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateBookRevisionRequest(
        @NotNull @Min(1) Integer revisionNo,
        boolean publishedYn,
        @NotNull PublishStatus publishStatusCd,
        @NotBlank @Size(max = 255) String fileName,
        @NotBlank @Size(max = 1000) String filePath,
        @Min(0) @Max(2) int encryptStatusCd) {}
