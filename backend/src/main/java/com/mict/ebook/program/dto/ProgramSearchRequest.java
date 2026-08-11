package com.mict.ebook.program.dto;

/** type/useYn은 프론트엔드에서 'ALL'을 필터 없음으로 사용한다. */
public record ProgramSearchRequest(Long workspaceId, String keyword, String type, String useYn) {}
