package com.mict.ebook.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAdminRequest(
        @NotBlank @Size(max = 50) String adminName, @NotBlank @Email @Size(max = 100) String email, boolean activeYn) {}
