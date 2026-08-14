package com.mict.ebook.bookset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBookSetRequest(
        @NotBlank @Size(max = 200) String setName, @Size(max = 500) String description, boolean activeYn) {}
