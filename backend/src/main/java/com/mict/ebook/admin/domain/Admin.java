package com.mict.ebook.admin.domain;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** cm_admin_bas 테이블 — reg_dtm/upd_dtm 컬럼명이 공용 BaseEntity와 달라 직접 둔다. */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Admin {

    private Long id;
    private String adminName;
    private String email;
    private String passwordHash;
    private int failCount;
    private Long registrantId;
    private Long updaterId;
    private boolean activeYn;
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Admin createNew(String adminName, String email, String passwordHash, Long registrantId) {
        Admin admin = new Admin();
        admin.adminName = adminName;
        admin.email = email;
        admin.passwordHash = passwordHash;
        admin.failCount = 0;
        admin.activeYn = true;
        admin.registrantId = registrantId;
        admin.updaterId = registrantId;
        return admin;
    }

    public void update(String adminName, String email, boolean activeYn, Long updaterId) {
        this.adminName = adminName;
        this.email = email;
        this.activeYn = activeYn;
        this.updaterId = updaterId;
    }

    public void recordLoginSuccess(String ip) {
        this.failCount = 0;
        this.lastLoginAt = LocalDateTime.now();
        this.lastLoginIp = ip;
    }

    public void recordLoginFailure() {
        this.failCount++;
    }
}
