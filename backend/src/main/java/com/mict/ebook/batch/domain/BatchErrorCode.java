package com.mict.ebook.batch.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BatchErrorCode implements ErrorCode {
    INVALID_TARGET_PATH("B001", "저장 경로가 올바르지 않습니다.", HttpStatus.BAD_REQUEST),
    TARGET_PATH_NOT_WRITABLE("B002", "저장 경로를 생성하거나 쓸 수 없습니다.", HttpStatus.BAD_REQUEST),
    DUMP_EXECUTION_FAILED("B003", "DB 백업 실행에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    DUMP_TIMEOUT("B004", "DB 백업 실행이 시간 초과되었습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    JOB_EXECUTION_FAILED("B005", "배치 작업 실행에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    BATCH_NOT_FOUND("B006", "배치를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    BATCH_CODE_DUPLICATE("B007", "이미 존재하는 배치 코드입니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
