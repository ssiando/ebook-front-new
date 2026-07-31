package com.mict.ebook.menu.dto;

import java.util.List;

public record MenuTreeResponse(String id, String label, String path, List<MenuTreeResponse> children) {}
