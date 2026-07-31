package com.mict.ebook.auth.dto;

import com.mict.ebook.menu.dto.MenuTreeResponse;
import java.util.List;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long adminPk,
        String adminId,
        String adminName,
        String email,
        String department,
        String status,
        List<String> roles,
        List<MenuTreeResponse> menus) {}
