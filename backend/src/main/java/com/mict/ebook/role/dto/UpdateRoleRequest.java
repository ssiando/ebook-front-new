package com.mict.ebook.role.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateRoleRequest(@NotBlank @Size(max = 100) String roleName, @Size(max = 500) String description) {}
