package com.mict.ebook.workspace.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** cm_workspace_bas 테이블 — 프로그램 관리 화면이 소속을 구분하는 워크스페이스. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Workspace {

    private Long id;
    private String name;
    private String stat;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
