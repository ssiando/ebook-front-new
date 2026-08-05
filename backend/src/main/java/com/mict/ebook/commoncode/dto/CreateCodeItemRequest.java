package com.mict.ebook.commoncode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCodeItemRequest(
        @NotBlank @Size(max = 50) String code,
        @NotBlank @Size(max = 100) String codeName,
        int sortOrder,
        boolean useYn,
        @Size(max = 255) String description,
        @Size(max = 255) String metadata,
        @Size(max = 100) String i18nKey) {}
