package com.mict.ebook.auth.dto;

import java.util.List;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long adminPk,
        String adminName,
        String email,
        List<String> roles) {}
