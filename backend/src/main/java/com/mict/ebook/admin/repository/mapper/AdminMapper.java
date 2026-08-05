package com.mict.ebook.admin.repository.mapper;

import com.mict.ebook.admin.domain.Admin;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminMapper {

    Optional<Admin> findByAccount(@Param("account") String account);

    List<String> findRoleNamesByAdminId(@Param("adminId") Long adminId);

    List<Admin> search(
            @Param("keyword") String keyword, @Param("department") String department, @Param("status") String status);

    Optional<Admin> findById(@Param("id") Long id);

    boolean existsByAdminId(@Param("adminId") String adminId);

    boolean existsByEmail(@Param("email") String email);

    void insert(Admin admin);

    void update(Admin admin);

    void deleteById(@Param("id") Long id);

    List<Long> findRoleIdsByAdminId(@Param("adminId") Long adminId);

    void deleteAdminRoles(@Param("adminId") Long adminId);

    void insertAdminRoles(@Param("adminId") Long adminId, @Param("roleIds") List<Long> roleIds);

    void updateLastLogin(@Param("id") Long id, @Param("lastLoginAt") LocalDateTime lastLoginAt);
}
