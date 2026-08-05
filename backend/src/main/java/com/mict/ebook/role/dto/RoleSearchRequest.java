package com.mict.ebook.role.dto;

import com.mict.ebook.role.domain.SystemType;

public record RoleSearchRequest(SystemType system, String keyword) {}
