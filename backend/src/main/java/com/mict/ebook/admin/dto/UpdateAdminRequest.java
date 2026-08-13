package com.mict.ebook.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public record UpdateAdminRequest(
        @NotBlank @Size(max = 50) String adminName,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(max = 50) String department,
        @NotBlank @Size(max = 20) String status,
        LocalDateTime serviceExpiresAt,
        List<String> groupCodes) {}
