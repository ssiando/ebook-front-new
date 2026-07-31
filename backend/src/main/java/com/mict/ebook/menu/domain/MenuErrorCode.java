package com.mict.ebook.menu.domain;

import com.mict.ebook.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum MenuErrorCode implements ErrorCode {
    MENU_NOT_FOUND("MN001", "메뉴를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    MENU_ID_DUPLICATE("MN002", "이미 존재하는 메뉴 ID입니다.", HttpStatus.CONFLICT),
    MENU_PARENT_NOT_FOUND("MN003", "상위 메뉴를 찾을 수 없습니다.", HttpStatus.BAD_REQUEST),
    MENU_HAS_CHILDREN("MN004", "하위 메뉴가 있어 삭제할 수 없습니다.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;
}
