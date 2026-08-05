package com.mict.ebook.role.domain;

import com.mict.ebook.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Role extends BaseEntity {

    private Long id;
    private String roleName;
    private String description;
    private String registrant;

    public static Role createNew(String roleName, String description, String registrant) {
        Role role = new Role();
        role.roleName = roleName;
        role.description = description;
        role.registrant = registrant;
        return role;
    }

    public void update(String roleName, String description, String registrant) {
        this.roleName = roleName;
        this.description = description;
        this.registrant = registrant;
    }
}
