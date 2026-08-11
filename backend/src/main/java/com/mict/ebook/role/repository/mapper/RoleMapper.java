package com.mict.ebook.role.repository.mapper;

import com.mict.ebook.role.domain.Role;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RoleMapper {

    List<Role> search(@Param("workspaceId") Long workspaceId, @Param("keyword") String keyword);

    Optional<Role> findById(@Param("id") Long id);

    boolean existsByWorkspaceIdAndRoleName(@Param("workspaceId") Long workspaceId, @Param("roleName") String roleName);

    boolean existsByWorkspaceIdAndRoleNameExcludingId(
            @Param("workspaceId") Long workspaceId, @Param("roleName") String roleName, @Param("id") Long id);

    void insert(Role role);

    void update(Role role);

    void deleteById(@Param("id") Long id);

    long countMembersByRoleId(@Param("roleId") Long roleId);

    List<Long> findProgramIdsByRoleId(@Param("roleId") Long roleId);

    void deleteRolePrograms(@Param("roleId") Long roleId);

    void insertRolePrograms(@Param("roleId") Long roleId, @Param("programIds") List<Long> programIds);
}
