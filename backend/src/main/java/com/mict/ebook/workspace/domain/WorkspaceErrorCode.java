package com.mict.ebook.workspace.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum WorkspaceErrorCode implements ErrorCode {
    WORKSPACE_NOT_FOUND("W001", "워크스페이스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    WORKSPACE_NAME_DUPLICATE("W002", "이미 존재하는 워크스페이스명입니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
