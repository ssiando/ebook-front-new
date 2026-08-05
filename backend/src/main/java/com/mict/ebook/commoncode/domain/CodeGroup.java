package com.mict.ebook.commoncode.domain;

import com.mict.ebook.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CodeGroup extends BaseEntity {

    private Long id;
    private String groupCode;
    private String groupName;
    private String description;
    private boolean useYn;
    private String i18nKey;

    public static CodeGroup createNew(
            String groupCode, String groupName, String description, boolean useYn, String i18nKey) {
        CodeGroup group = new CodeGroup();
        group.groupCode = groupCode;
        group.groupName = groupName;
        group.description = description;
        group.useYn = useYn;
        group.i18nKey = i18nKey;
        return group;
    }

    public void update(String groupCode, String groupName, String description, boolean useYn, String i18nKey) {
        this.groupCode = groupCode;
        this.groupName = groupName;
        this.description = description;
        this.useYn = useYn;
        this.i18nKey = i18nKey;
    }
}
