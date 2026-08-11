package com.mict.ebook.program.dto;

import java.util.List;

public record ProgramListResponse(List<ProgramResponse> items, long totalCount) {

    public static ProgramListResponse of(List<ProgramResponse> items) {
        return new ProgramListResponse(items, items.size());
    }
}
