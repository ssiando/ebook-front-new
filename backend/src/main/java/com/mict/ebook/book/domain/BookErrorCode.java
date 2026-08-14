package com.mict.ebook.book.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BookErrorCode implements ErrorCode {
    BOOK_NOT_FOUND("BK001", "도서를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    ISBN_DUPLICATE("BK002", "이미 존재하는 ISBN입니다.", HttpStatus.CONFLICT),
    EMPTY_FILE("BK003", "업로드할 파일이 없습니다.", HttpStatus.BAD_REQUEST),
    UNSUPPORTED_FILE_TYPE("BK004", "지원하지 않는 이미지 형식입니다. (png, jpg, webp, gif만 가능)", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED("BK005", "파일 업로드에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    REVISION_NOT_FOUND("BK006", "도서 버전을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    REVISION_NO_DUPLICATE("BK007", "이미 존재하는 버전 번호입니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
