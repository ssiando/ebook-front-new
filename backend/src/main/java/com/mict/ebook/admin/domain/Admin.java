package com.mict.ebook.admin.domain;

import com.mict.ebook.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Admin extends BaseEntity {

    private Long id;
    private String adminId;
    private String adminName;
    private String email;
    private String passwordHash;
    private String department;
    private String status;
    private String registrant;
}
