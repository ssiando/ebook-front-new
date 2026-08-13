package com.mict.ebook.admin.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AdminErrorCode implements ErrorCode {
    ADMIN_NOT_FOUND("A001", "관리자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    EMAIL_DUPLICATE("A003", "이미 존재하는 이메일입니다.", HttpStatus.CONFLICT),
    LOGIN_ID_DUPLICATE("A004", "이미 존재하는 관리자ID입니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
