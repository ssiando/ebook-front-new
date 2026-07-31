package com.mict.ebook.menu.repository.mapper;

import com.mict.ebook.menu.domain.Menu;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MenuMapper {

    List<Menu> findAllOrderBySortOrder();

    List<Menu> search(
            @Param("parentId") String parentId,
            @Param("keyword") String keyword,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize);

    long countBySearch(@Param("parentId") String parentId, @Param("keyword") String keyword);

    Optional<Menu> findById(@Param("id") String id);

    boolean existsById(@Param("id") String id);

    void insert(Menu menu);

    void update(Menu menu);

    void deleteById(@Param("id") String id);

    long countChildrenByParentId(@Param("parentId") String parentId);
}
