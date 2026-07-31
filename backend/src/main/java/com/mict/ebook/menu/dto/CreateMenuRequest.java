package com.mict.ebook.menu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMenuRequest(
        @NotBlank @Size(max = 50) String id,
        @Size(max = 50) String parentId,
        @NotBlank @Size(max = 100) String label,
        @Size(max = 255) String path,
        int sortOrder) {}
