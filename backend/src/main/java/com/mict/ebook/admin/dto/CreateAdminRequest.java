package com.mict.ebook.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateAdminRequest(
        @NotBlank @Size(max = 50) String adminName,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 4, max = 100) String password,
        List<Long> roleIds) {}
