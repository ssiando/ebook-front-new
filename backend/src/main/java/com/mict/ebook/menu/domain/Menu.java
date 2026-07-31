package com.mict.ebook.menu.domain;

import com.mict.ebook.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Menu extends BaseEntity {

    private String id;
    private String parentId;
    private String label;
    private String path;
    private int sortOrder;

    public static Menu createNew(String id, String parentId, String label, String path, int sortOrder) {
        Menu menu = new Menu();
        menu.id = id;
        menu.parentId = parentId;
        menu.label = label;
        menu.path = path;
        menu.sortOrder = sortOrder;
        return menu;
    }

    public void update(String parentId, String label, String path, int sortOrder) {
        this.parentId = parentId;
        this.label = label;
        this.path = path;
        this.sortOrder = sortOrder;
    }
}
