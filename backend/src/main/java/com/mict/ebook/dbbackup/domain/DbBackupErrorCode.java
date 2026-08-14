package com.mict.ebook.dbbackup.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum DbBackupErrorCode implements ErrorCode {
    DB_BACKUP_NOT_FOUND("DB001", "백업 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    DB_BACKUP_NAME_DUPLICATE("DB002", "이미 존재하는 백업명입니다.", HttpStatus.CONFLICT),
    DB_BACKUP_FILE_MISSING("DB003", "백업 파일을 찾을 수 없어 복원할 수 없습니다.", HttpStatus.BAD_REQUEST),
    DB_RESTORE_FAILED("DB004", "DB 복원에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    DB_BACKUP_JOB_FAILED("DB005", "DB 백업 실행에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
