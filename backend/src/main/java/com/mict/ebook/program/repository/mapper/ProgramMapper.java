package com.mict.ebook.program.repository.mapper;

import com.mict.ebook.program.domain.Program;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProgramMapper {

    List<Program> search(
            @Param("workspaceId") Long workspaceId,
            @Param("keyword") String keyword,
            @Param("type") String type,
            @Param("useYn") Boolean useYn);

    Optional<Program> findById(@Param("id") Long id);

    boolean existsByWorkspaceIdAndCode(@Param("workspaceId") Long workspaceId, @Param("code") String code);

    boolean existsByWorkspaceIdAndCodeExcludingId(
            @Param("workspaceId") Long workspaceId, @Param("code") String code, @Param("id") Long id);

    void insert(Program program);

    void update(Program program);

    void deleteByIds(@Param("ids") List<Long> ids);
}
