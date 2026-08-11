package com.mict.ebook.program.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프로그램 관리 화면(cm_program_bas 테이블)의 프로그램/API 카탈로그.
 * reg_dtm/upd_dtm 등 감사 컬럼명이 공용 BaseEntity(created_at/updated_at)와 달라 이 엔티티에 직접 둔다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Program {

    private Long id;
    private Long workspaceId;
    private Long parentProgramId;
    private String code;
    private String name;
    private String type;
    private String httpMethod;
    private String url;
    private int sortOrder;
    private boolean displayYn;
    private boolean useYn;
    private Long i18nKeyId;
    private String description;
    private Long registrantId;
    private Long updaterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Program createNew(
            Long workspaceId,
            Long parentProgramId,
            String code,
            String name,
            String type,
            String httpMethod,
            String url,
            int sortOrder,
            boolean displayYn,
            boolean useYn,
            Long i18nKeyId,
            String description,
            Long registrantId) {
        Program program = new Program();
        program.workspaceId = workspaceId;
        program.parentProgramId = parentProgramId;
        program.code = code;
        program.name = name;
        program.type = type;
        program.httpMethod = httpMethod == null ? "" : httpMethod;
        program.url = url;
        program.sortOrder = sortOrder;
        program.displayYn = displayYn;
        program.useYn = useYn;
        program.i18nKeyId = i18nKeyId;
        program.description = description;
        program.registrantId = registrantId;
        program.updaterId = registrantId;
        return program;
    }

    public void update(
            Long parentProgramId,
            String code,
            String name,
            String type,
            String httpMethod,
            String url,
            int sortOrder,
            boolean displayYn,
            boolean useYn,
            Long i18nKeyId,
            String description,
            Long updaterId) {
        this.parentProgramId = parentProgramId;
        this.code = code;
        this.name = name;
        this.type = type;
        this.httpMethod = httpMethod == null ? "" : httpMethod;
        this.url = url;
        this.sortOrder = sortOrder;
        this.displayYn = displayYn;
        this.useYn = useYn;
        this.i18nKeyId = i18nKeyId;
        this.description = description;
        this.updaterId = updaterId;
    }
}
