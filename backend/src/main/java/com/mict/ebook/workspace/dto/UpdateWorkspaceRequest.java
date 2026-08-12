package com.mict.ebook.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateWorkspaceRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 500) String description,
        @NotBlank @Pattern(regexp = "ACTIVE|INACTIVE") String stat) {}
