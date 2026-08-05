package com.mict.ebook.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateAdminRequest(
        @NotBlank @Size(max = 50) String adminId,
        @NotBlank @Size(max = 100) String adminName,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(max = 255) String password,
        @Size(max = 100) String department,
        List<Long> roleIds,
        @Size(max = 50) String registrant) {}
