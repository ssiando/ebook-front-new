package com.mict.ebook.role.repository.mapper;

import com.mict.ebook.role.domain.Role;
import com.mict.ebook.role.domain.SystemType;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RoleMapper {

    List<Role> search(@Param("system") SystemType system, @Param("keyword") String keyword);

    Optional<Role> findById(@Param("id") Long id);

    boolean existsByRoleNameAndSystem(@Param("roleName") String roleName, @Param("system") SystemType system);

    void insert(Role role);

    void update(Role role);

    void deleteById(@Param("id") Long id);

    long countMembersByRoleId(@Param("roleId") Long roleId);

    List<String> findProgramIdsByRoleId(@Param("roleId") Long roleId);

    void deleteRolePrograms(@Param("roleId") Long roleId);

    void insertRolePrograms(@Param("roleId") Long roleId, @Param("programIds") List<String> programIds);
}
