package com.mict.ebook.commoncode.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CommonCodeErrorCode implements ErrorCode {
    GROUP_NOT_FOUND("CC001", "공통코드 그룹을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    GROUP_CODE_DUPLICATE("CC002", "이미 존재하는 그룹 코드입니다.", HttpStatus.CONFLICT),
    ITEM_NOT_FOUND("CC003", "공통코드 항목을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    ITEM_CODE_DUPLICATE("CC004", "이미 존재하는 코드입니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
