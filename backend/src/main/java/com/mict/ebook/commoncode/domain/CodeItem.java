package com.mict.ebook.commoncode.domain;

import com.mict.ebook.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CodeItem extends BaseEntity {

    private Long id;
    private Long groupId;
    private String code;
    private String codeName;
    private int sortOrder;
    private boolean useYn;
    private String description;
    private String metadata;
    private String i18nKey;

    public static CodeItem createNew(
            Long groupId,
            String code,
            String codeName,
            int sortOrder,
            boolean useYn,
            String description,
            String metadata,
            String i18nKey) {
        CodeItem item = new CodeItem();
        item.groupId = groupId;
        item.code = code;
        item.codeName = codeName;
        item.sortOrder = sortOrder;
        item.useYn = useYn;
        item.description = description;
        item.metadata = metadata;
        item.i18nKey = i18nKey;
        return item;
    }

    public void update(
            String code,
            String codeName,
            int sortOrder,
            boolean useYn,
            String description,
            String metadata,
            String i18nKey) {
        this.code = code;
        this.codeName = codeName;
        this.sortOrder = sortOrder;
        this.useYn = useYn;
        this.description = description;
        this.metadata = metadata;
        this.i18nKey = i18nKey;
    }
}
