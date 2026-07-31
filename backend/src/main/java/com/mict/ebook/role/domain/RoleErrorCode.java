package com.mict.ebook.role.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum RoleErrorCode implements ErrorCode {
    ROLE_NOT_FOUND("R001", "역할을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    ROLE_NAME_DUPLICATE("R002", "이미 존재하는 역할명입니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
