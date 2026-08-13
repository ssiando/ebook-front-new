package com.mict.ebook.batch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBatchRequest(
        @NotBlank @Size(max = 100) String batchName,
        @Size(max = 100) String schedule,
        @Size(max = 255) String description,
        boolean requiresPath) {}
