package com.mict.ebook.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CommonErrorCode implements ErrorCode {
    INVALID_INPUT("C001", "요청 값이 올바르지 않습니다.", HttpStatus.BAD_REQUEST),
    NOT_FOUND("C002", "요청한 리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INTERNAL_ERROR("C003", "서버 내부 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED("C004", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("C005", "접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
    FILE_TOO_LARGE("C006", "업로드 파일 용량이 너무 큽니다.", HttpStatus.PAYLOAD_TOO_LARGE);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
