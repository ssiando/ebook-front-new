package com.mict.ebook.workspace.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** cm_workspace_bas 테이블 — 프로그램 관리 화면이 소속을 구분하는 워크스페이스. reg_dtm/upd_dtm 컬럼명이 공용 BaseEntity와 달라 직접 둔다. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Workspace {

    private Long id;
    private String name;
    private String stat;
    private String description;
    private Long registrantId;
    private Long updaterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Workspace createNew(String name, String description, Long registrantId) {
        Workspace workspace = new Workspace();
        workspace.name = name;
        workspace.description = description;
        workspace.stat = "ACTIVE";
        workspace.registrantId = registrantId;
        workspace.updaterId = registrantId;
        return workspace;
    }

    public void update(String name, String description, String stat, Long updaterId) {
        this.name = name;
        this.description = description;
        this.stat = stat;
        this.updaterId = updaterId;
    }
}
