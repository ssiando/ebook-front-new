package com.mict.ebook.commoncode.repository.mapper;

import com.mict.ebook.commoncode.domain.CodeGroup;
import com.mict.ebook.commoncode.domain.CodeItem;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CommonCodeMapper {

    List<CodeGroup> searchGroups(@Param("keyword") String keyword, @Param("useYn") String useYn);

    Optional<CodeGroup> findGroupById(@Param("id") Long id);

    Optional<CodeGroup> findGroupByCode(@Param("groupCode") String groupCode);

    boolean existsGroupByCode(@Param("groupCode") String groupCode);

    boolean existsGroupByCodeExcludingId(@Param("groupCode") String groupCode, @Param("id") Long id);

    void insertGroup(CodeGroup group);

    void updateGroup(CodeGroup group);

    void deleteGroupById(@Param("id") Long id);

    List<CodeItem> findItemsByGroupId(@Param("groupId") Long groupId);

    List<CodeItem> findItemsByGroupCode(@Param("groupCode") String groupCode);

    Optional<CodeItem> findItemById(@Param("id") Long id);

    boolean existsItemByGroupIdAndCode(@Param("groupId") Long groupId, @Param("code") String code);

    boolean existsItemByGroupIdAndCodeExcludingId(
            @Param("groupId") Long groupId, @Param("code") String code, @Param("id") Long id);

    void insertItem(CodeItem item);

    void updateItem(CodeItem item);

    void deleteItemById(@Param("id") Long id);
}
