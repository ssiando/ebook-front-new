package com.mict.ebook.menu.dto;

public record MenuSearchRequest(String parentId, String keyword, int page, int pageSize) {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 200;

    public MenuSearchRequest {
        if (page < 1) {
            page = DEFAULT_PAGE;
        }
        if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
            pageSize = DEFAULT_PAGE_SIZE;
        }
    }

    public int offset() {
        return (page - 1) * pageSize;
    }
}
