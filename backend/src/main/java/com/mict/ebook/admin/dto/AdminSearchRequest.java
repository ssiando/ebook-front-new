package com.mict.ebook.admin.dto;

import java.time.LocalDate;

public record AdminSearchRequest(
        LocalDate updatedFrom, LocalDate updatedTo, String keyword, String department, String status) {}
