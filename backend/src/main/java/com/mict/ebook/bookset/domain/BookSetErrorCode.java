package com.mict.ebook.bookset.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BookSetErrorCode implements ErrorCode {
    BOOK_SET_NOT_FOUND("BS001", "도서 세트를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    BOOK_SET_NAME_DUPLICATE("BS002", "이미 존재하는 세트명입니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
