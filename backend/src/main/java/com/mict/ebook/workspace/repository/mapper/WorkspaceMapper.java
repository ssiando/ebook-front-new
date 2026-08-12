package com.mict.ebook.workspace.repository.mapper;

import com.mict.ebook.workspace.domain.Workspace;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WorkspaceMapper {

    List<Workspace> search(@Param("keyword") String keyword);

    Optional<Workspace> findById(@Param("id") Long id);

    boolean existsByName(@Param("name") String name);

    boolean existsByNameExcludingId(@Param("name") String name, @Param("id") Long id);

    void insert(Workspace workspace);

    void update(Workspace workspace);

    void deleteById(@Param("id") Long id);
}
