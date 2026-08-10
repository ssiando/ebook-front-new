package com.mict.ebook.role.dto;

import com.mict.ebook.role.domain.SystemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateRoleRequest(
        @NotBlank @Size(max = 100) String roleName,
        @Size(max = 255) String description,
        @NotNull SystemType system,
        @Size(max = 50) String registrant) {}
