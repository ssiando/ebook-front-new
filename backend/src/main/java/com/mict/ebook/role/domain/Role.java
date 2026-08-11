package com.mict.ebook.role.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** cm_role_bas 테이블 — 워크스페이스별 역할. reg_dtm/upd_dtm 컬럼명이 공용 BaseEntity와 달라 직접 둔다. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Role {

    private Long id;
    private Long workspaceId;
    private String roleName;
    private String description;
    private boolean activeYn;
    private Long registrantId;
    private Long updaterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Role createNew(Long workspaceId, String roleName, String description, Long registrantId) {
        Role role = new Role();
        role.workspaceId = workspaceId;
        role.roleName = roleName;
        role.description = description;
        role.activeYn = true;
        role.registrantId = registrantId;
        role.updaterId = registrantId;
        return role;
    }

    public void update(String roleName, String description, Long updaterId) {
        this.roleName = roleName;
        this.description = description;
        this.updaterId = updaterId;
    }
}
