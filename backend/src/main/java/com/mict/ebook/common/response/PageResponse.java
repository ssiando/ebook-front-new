package com.mict.ebook.common.response;

import java.util.List;

public record PageResponse<T>(List<T> items, long totalCount, int page, int pageSize) {

    public static <T> PageResponse<T> of(List<T> items, long totalCount, int page, int pageSize) {
        return new PageResponse<>(items, totalCount, page, pageSize);
    }
}
