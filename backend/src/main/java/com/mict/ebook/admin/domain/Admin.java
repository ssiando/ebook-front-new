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
    private String loginId;
    private String adminName;
    private String email;
    private String passwordHash;
    private String department;
    private int failCount;
    private Long registrantId;
    private Long updaterId;
    private boolean activeYn;
    private String status;
    private LocalDateTime serviceExpiresAt;
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Admin createNew(
            String loginId, String adminName, String email, String passwordHash, String department, Long registrantId) {
        Admin admin = new Admin();
        admin.loginId = loginId;
        admin.adminName = adminName;
        admin.email = email;
        admin.passwordHash = passwordHash;
        admin.department = department;
        admin.failCount = 0;
        admin.activeYn = true;
        admin.status = "NEW";
        admin.registrantId = registrantId;
        admin.updaterId = registrantId;
        return admin;
    }

    public void update(
            String adminName,
            String email,
            String department,
            String status,
            LocalDateTime serviceExpiresAt,
            Long updaterId) {
        this.adminName = adminName;
        this.email = email;
        this.department = department;
        this.status = status;
        this.serviceExpiresAt = serviceExpiresAt;
        // status가 별도 컬럼으로 분리되어 있지만, 로그인 차단 판단은 여전히 activeYn(active_yn)이 담당한다 — INACTIVE일 때만 false로 파생시킨다.
        this.activeYn = !"INACTIVE".equals(status);
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
