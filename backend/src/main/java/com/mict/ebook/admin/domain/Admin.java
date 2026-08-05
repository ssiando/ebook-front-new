package com.mict.ebook.admin.domain;

import com.mict.ebook.common.entity.BaseEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Admin extends BaseEntity {

    private static final String DEFAULT_STATUS = "NEW";

    private Long id;
    private String adminId;
    private String adminName;
    private String email;
    private String passwordHash;
    private String department;
    // 콤마(,)로 구분한 그룹 태그 원본 문자열. 목록 형태는 AdminRestMapper에서 변환한다.
    private String groupNames;
    private LocalDate serviceExpiresAt;
    private LocalDateTime lastLoginAt;
    private String status;
    private String registrant;

    public static Admin createNew(
            String adminId, String adminName, String email, String passwordHash, String department, String registrant) {
        Admin admin = new Admin();
        admin.adminId = adminId;
        admin.adminName = adminName;
        admin.email = email;
        admin.passwordHash = passwordHash;
        admin.department = department;
        admin.status = DEFAULT_STATUS;
        admin.registrant = registrant;
        return admin;
    }

    public void update(
            String adminName,
            String email,
            String department,
            String status,
            String registrant,
            String groupNames,
            LocalDate serviceExpiresAt) {
        this.adminName = adminName;
        this.email = email;
        this.department = department;
        this.status = status;
        this.registrant = registrant;
        this.groupNames = groupNames;
        this.serviceExpiresAt = serviceExpiresAt;
    }
}
