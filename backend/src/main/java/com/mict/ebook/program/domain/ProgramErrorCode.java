package com.mict.ebook.program.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ProgramErrorCode implements ErrorCode {
    NOT_FOUND("PG001", "프로그램을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    CODE_DUPLICATE("PG002", "이미 존재하는 프로그램 코드입니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
