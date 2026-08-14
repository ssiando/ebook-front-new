package com.mict.ebook.book.dto;

public record BookSearchRequest(String keyword, String bookType, Boolean activeYn) {}
