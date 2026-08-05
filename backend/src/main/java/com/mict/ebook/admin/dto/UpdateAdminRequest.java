package com.mict.ebook.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record UpdateAdminRequest(
        @NotBlank @Size(max = 100) String adminName,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 100) String department,
        @NotBlank @Size(max = 20) String status,
        @Size(max = 50) String registrant,
        boolean workspaceAdmin,
        List<String> groups,
        LocalDate serviceExpiresAt) {}
