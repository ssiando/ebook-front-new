package com.mict.ebook.commoncode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCodeGroupRequest(
        @NotBlank @Size(max = 50) String groupCode,
        @NotBlank @Size(max = 100) String groupName,
        @Size(max = 255) String description,
        boolean useYn,
        @Size(max = 100) String i18nKey) {}
